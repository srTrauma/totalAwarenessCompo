import Button from "./Button"

interface Props {
    Title: string,
    imgUrl: string,
    content: string,
    buttonText?: string
}

export default function NobgTextwImage({Title, imgUrl, content, buttonText = "Learn More"} : Props) {
    return (
        <section className="flex flex-col md:flex-row w-full items-center justify-between py-16 px-6 max-w-7xl mx-auto gap-8">
            <div className="flex flex-col w-full md:w-1/2 gap-6">
                <h2 className="text-2xl md:text-3xl font-medium text-gray-800">{Title}</h2>
                <p className="text-base leading-relaxed text-gray-600">{content}</p>
                <div className="mt-4">
                    <Button Text={buttonText} />
                </div>
            </div>
            <div className="w-full md:w-5/12 mt-8 md:mt-0">
                <img 
                    src={imgUrl} 
                    alt={Title} 
                    className="w-full h-auto object-cover rounded-md shadow-sm" 
                />
            </div>
        </section>
    )
}