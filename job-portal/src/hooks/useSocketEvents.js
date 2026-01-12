import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';
import { competitionKeys } from './useCompetitions';

export function useSocketEvents() {
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) return;

        const handleCompetitionUpdate = (data) => {
            console.log('Real-time update received:', data);

            // Invalidate the generic list
            queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });

            // If it's a specific update, invalidate that detail too
            if (data.competitionId) {
                queryClient.invalidateQueries({ queryKey: competitionKeys.detail(data.competitionId) });
            }
        };

        socket.on('competition_updated', handleCompetitionUpdate);

        return () => {
            socket.off('competition_updated', handleCompetitionUpdate);
        };
    }, [socket, queryClient]);
}
