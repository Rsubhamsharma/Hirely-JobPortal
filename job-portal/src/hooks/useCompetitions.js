import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Query Keys - centralized for consistency
export const competitionKeys = {
    all: ['competitions'],
    lists: () => [...competitionKeys.all, 'list'],
    list: (filters) => [...competitionKeys.lists(), filters],
    details: () => [...competitionKeys.all, 'detail'],
    detail: (id) => [...competitionKeys.details(), id],
};

/**
 * Fetch all competitions
 */
export function useCompetitions() {
    return useQuery({
        queryKey: competitionKeys.lists(),
        queryFn: async () => {
            const response = await api.get('/competitions');
            return response.data.data;
        },
    });
}

/**
 * Fetch a single competition by ID
 * Returns competition data with isRegistered flag computed from applicants array
 */
export function useCompetition(competitionId) {
    return useQuery({
        queryKey: competitionKeys.detail(competitionId),
        queryFn: async () => {
            const response = await api.get(`/competitions/${competitionId}`);
            return response.data.data;
        },
        enabled: !!competitionId,
    });
}

/**
 * Register for a competition
 * Invalidates all competition queries to ensure UI reflects new state
 */
export function useRegisterCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (competitionId) => {
            const response = await api.post(`/competitions/register/${competitionId}`);
            return response.data;
        },
        onSuccess: (data, competitionId) => {
            toast.success(data.message || 'Successfully registered!');
            // Invalidate all competition queries to refresh the data everywhere
            queryClient.invalidateQueries({ queryKey: competitionKeys.all });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Registration failed');
        },
    });
}

/**
 * Create a new competition (for recruiters)
 */
export function useCreateCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post('/competitions/create', formData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Competition created successfully!');
            queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create competition');
        },
    });
}

/**
 * Update an existing competition
 */
export function useUpdateCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ competitionId, formData }) => {
            const response = await api.patch(`/competitions/${competitionId}`, formData);
            return response.data;
        },
        onSuccess: (data, variables) => {
            toast.success('Competition updated successfully!');
            queryClient.invalidateQueries({ queryKey: competitionKeys.all });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update competition');
        },
    });
}

/**
 * Delete a competition
 */
export function useDeleteCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (competitionId) => {
            const response = await api.delete(`/competitions/${competitionId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Competition deleted successfully!');
            queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete competition');
        },
    });
}

/**
 * Helper to check if a user is registered for a competition
 */
export function isUserRegistered(competition, userId) {
    if (!competition?.applicants || !userId) return false;

    // Handle both populated and non-populated applicants array
    return competition.applicants.some(applicant => {
        if (typeof applicant === 'object') {
            return applicant._id === userId;
        }
        return applicant === userId;
    });
}
