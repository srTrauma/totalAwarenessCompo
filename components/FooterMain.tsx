export default function FooterMain() {
    return (
        <footer className="text-center p-8 bg-gray-800 text-white">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Presentation Column */}
                <div>
                    <h2 className="text-lg font-bold mb-4">Total Awareness</h2>
                    <p>Your go-to platform for comprehensive awareness and insights.</p>
                </div>
                
                {/* Social Media Column */}
                <div>
                    <h2 className="text-lg font-bold mb-4">Follow Us</h2>
                    <ul className="list-none p-0">
                        <li className="mb-2">
                            <a href="https://facebook.com" className="no-underline text-white hover:text-gray-400">Facebook</a>
                        </li>
                        <li className="mb-2">
                            <a href="https://twitter.com" className="no-underline text-white hover:text-gray-400">Twitter</a>
                        </li>
                        <li className="mb-2">
                            <a href="https://instagram.com" className="no-underline text-white hover:text-gray-400">Instagram</a>
                        </li>
                        <li className="mb-2">
                            <a href="https://linkedin.com" className="no-underline text-white hover:text-gray-400">LinkedIn</a>
                        </li>
                    </ul>
                </div>
                
                {/* Navigation Column */}
                <div>
                    <h2 className="text-lg font-bold mb-4">Navigation</h2>
                    <ul className="list-none p-0">
                        <li className="mb-2">
                            <a href="/about" className="no-underline text-white hover:text-gray-400">About Us</a>
                        </li>
                        <li className="mb-2">
                            <a href="/services" className="no-underline text-white hover:text-gray-400">Services</a>
                        </li>
                        <li className="mb-2">
                            <a href="/contact" className="no-underline text-white hover:text-gray-400">Contact</a>
                        </li>
                    </ul>
                </div>
                
                {/* Terms and Policies Column */}
                <div>
                    <h2 className="text-lg font-bold mb-4">Legal</h2>
                    <ul className="list-none p-0">
                        <li className="mb-2">
                            <a href="/privacy" className="no-underline text-white hover:text-gray-400">Privacy Policy</a>
                        </li>
                        <li className="mb-2">
                            <a href="/terms" className="no-underline text-white hover:text-gray-400">Terms of Service</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mt-8">
                <p>&copy; 2024 Total Awareness. All rights reserved.</p>
            </div>
        </footer>
    );
}