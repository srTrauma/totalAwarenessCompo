interface Props {
  ImageSrc: string;
  text: string;
  Title: string;
}

export default function SimpleTextWImage({ ImageSrc, text, Title }: Props) {
  return (
    <section className="flex w-full flex-col my-16">
      <div className="flex flex-row justify-between bg-white rounded-lg mx-auto w-4/5 max-w-5xl shadow-md p-8">
        <div className="w-1/2 flex flex-col gap-6 pr-8">
          <h2 className="text-2xl font-light text-gray-800 mb-2">{Title}</h2>
          <p className="text-gray-600 leading-relaxed">{text}</p>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <img 
            src={ImageSrc} 
            alt={Title}
            className="max-w-full h-auto object-cover rounded"
          />
        </div>
      </div>
    </section>
  );
}
