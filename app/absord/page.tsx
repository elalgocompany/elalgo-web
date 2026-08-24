"use client"

import React from "react";


const [data , setData ] = React.useState('') ; 







function Saveinpot_text(event:any){

    setData(event.target.value) ; 

}


console.log(data) ; 


export default function chat (){

    return(

        <div className="bg-gray-100">
            <input 
                placeholder="type somthing "  
                onChange={Saveinpot_text} 
            />

        </div>
        
         
        

    );

}