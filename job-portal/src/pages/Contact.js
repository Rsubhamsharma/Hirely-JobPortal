import { useForm } from "react-hook-form"


function Contact() {
    const { register, handleSubmit } = useForm()
    const onSubmit = (data) => console.log(data)

    return (
        <>
            <div className="">
                <div>
                    <h4 className="text-white font-semibold text-lg mb-6">Contact</h4>
                    <ul className="space-y-4 text-slate-400">
                        <li className="flex items-start gap-3">
                            <span>📧</span>
                            <a href="mailto:support@jobportal.com" className="hover:text-white transition-colors">support@jobportal.com</a>
                        </li>
                        <li className="flex items-start gap-3">
                            <span>📞</span>
                            <span>+91 123 456 7890</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span>📍</span>
                            <span>123 Tech Park, Innovation City, India</span>
                        </li>
                    </ul>
                </div>
            </div>

        </>
    )
}
export default Contact