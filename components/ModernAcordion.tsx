import { useState } from "react";
import Button from "./Button";

interface Props {
  Title: string;
  sections: { title: string; content: string }[];
}

const ModernAccordion: React.FC<Props> = ({ Title, sections }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <article className="py-12 max-w-5xl mx-auto">
      <div className="flex flex-col">
        <div className="flex flex-row shadow-md bg-white rounded-lg overflow-hidden">
          <div className="flex flex-col justify-center items-start p-10 w-1/2 space-y-6">
            <img 
              src="/imagesToGuapas/coso.png" 
              alt="Feature illustration" 
              className="h-16 w-auto mb-4"
            />
            <h2 className="text-2xl font-medium text-gray-800">{Title}</h2>
            <p className="text-gray-600 leading-relaxed">
              Innovative solutions tailored to your business needs. We provide comprehensive 
              services designed to enhance your operational efficiency and drive growth.
            </p>
            <Button Text="Learn More" blue href="#" />
          </div>
          <div className="w-1/2 bg-gray-50 p-8">
            <h3 className="text-xl font-medium mb-6 text-gray-800 border-b pb-3">Key Features</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className="cursor-pointer"
                >
                  <div 
                    className={`flex items-center p-3 rounded transition-colors ${
                      activeIndex === index ? "bg-gray-100" : "hover:bg-gray-100/50"
                    }`}
                  >
                    <h4 className="font-medium text-gray-700">{section.title}</h4>
                    <div className="ml-auto">
                      {activeIndex === index ? 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      }
                    </div>
                  </div>
                  {activeIndex === index && (
                    <div className="pl-6 pr-4 py-3 text-gray-600 text-sm">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ModernAccordion;
