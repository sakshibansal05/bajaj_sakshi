require("dotenv").config();

const express=require("express");
const cors=require("cors");
const axios=require("axios");
const {fibonacci,prime,hcf,lcm}=require("./utils/math");

const app=express();

app.use(cors());
app.use(express.json());

const EMAIL=process.env.EMAIL;

function successResponse(data){
    return{
        is_success:true,
        official_email:EMAIL,
        data:data
    }
}

function errorResponse(msg){
    return{
        is_success:false,
        official_email:EMAIL,
        error:msg
    }
}

app.get("/health",(req,res)=>{
    res.status(200).json({
        is_success:true,
        official_email:EMAIL
    });
});

app.post("/bfhl",async(req,res)=>{
    try{

        const body=req.body;

        if(!body || typeof body!=="object"){
            return res.status(400).json(errorResponse("Invalid JSON body"));
        }

        const keys=["fibonacci","prime","lcm","hcf","AI"]
            .filter(k=>body[k]!==undefined);

        if(keys.length!==1){
            return res.status(400).json(
                errorResponse("Exactly one functional key required")
            );
        }

        let result=null;

        if(body.fibonacci!==undefined){

            if(typeof body.fibonacci!=="number" || body.fibonacci<0){
                return res.status(400).json(
                    errorResponse("Invalid fibonacci input")
                );
            }

            result=fibonacci(body.fibonacci);
        }

        else if(body.prime!==undefined){

            if(!Array.isArray(body.prime)){
                return res.status(400).json(
                    errorResponse("Prime input must be array")
                );
            }

            result=prime(body.prime);
        }

        else if(body.lcm!==undefined){

            if(!Array.isArray(body.lcm)){
                return res.status(400).json(
                    errorResponse("LCM input must be array")
                );
            }

            result=lcm(body.lcm);
        }

        else if(body.hcf!==undefined){

            if(!Array.isArray(body.hcf)){
                return res.status(400).json(
                    errorResponse("HCF input must be array")
                );
            }

            result=hcf(body.hcf);
        }

        else if(body.AI!==undefined){

            if(typeof body.AI!=="string"){
                return res.status(400).json(
                    errorResponse("AI input must be string")
                );
            }

            const aiResponse=await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents:[
                        {
                            parts:[
                                {
                                    text:`Answer in one word only: ${body.AI}`
                                }
                            ]
                        }
                    ]
                }
            );

            result=aiResponse.data
                .candidates[0]
                .content
                .parts[0]
                .text
                .trim();
        }

        res.status(200).json(successResponse(result));

    }catch(err){
        console.error(err);
        res.status(500).json(errorResponse("Server Error"));
    }
});

const PORT=process.env.PORT || 5000;

module.exports = app;

