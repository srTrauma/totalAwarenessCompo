export default function MarquesinaTexto() {
    return (
        <div className="flex justify-center items-center flex-col py-16 gap-8">
            <h3 className="text-2xl font-light tracking-wider">TOTAL AWARENESS</h3>
            <div className="marquee overflow-hidden w-full">
                <div className="marquee-content flex space-x-12">
                    <span className="text-gray-500 font-light text-lg">Eficiencia</span>
                    <span className="text-gray-500 font-light text-lg">Precisión</span>
                    <span className="text-gray-500 font-light text-lg">Optimización</span>
                    <span className="text-gray-500 font-light text-lg">Integridad</span>
                    <span className="text-gray-500 font-light text-lg">Innovación</span>
                </div>
            </div>
        </div>
    )
}
