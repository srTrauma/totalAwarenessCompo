

interface Props{
    Text : string,
    blue?:boolean,
    href?:string
}


export default function Button({Text, blue, href} : Props){
    return(
        <div className={blue? "bg-[darkblue] text-white p-3 rounded-lg flex justify-center items-center cursor-pointer hover:scale-110" : "border-2 border-solid border-black rounded-lg flex justify-center items-center p-3 cursor-pointer hover:scale-110"}>
            <a href={href}>{Text}</a>
        </div>
    )
}