import bcrypt from 'bcrypt'
import validator from "validator"
import {v2 as cloudinary } from "cloudinary"
import doctorsModel from '../models/doctorsmodels.js'
import jwt from 'jsonwebtoken'
// API FOR ADDING DOCTOR

const addDoctor=async(req,res)=>{
    try{
        const { name, email, password, fees,about,degree,address,speciality,experience}=req.body

        const imageFile=req.file

        if(!name ||!email ||!password || !speciality || !degree  ||!about ||!fees ||!address  ||!experience)
            return res.json({success:false,message:"missing detail"})
    
    

    if( !validator.isEmail(email)){
        return res.json({success:false,message:"please enter valid email"})

    }
    if(password.length<8){
        return res.json({success:false,message:"enter strong password"})
    }

    const salt=await bcrypt.genSalt(10)
    const hashedPassord=await bcrypt.hash(password,salt)


    const imageUpload =await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})

    const imageUrl=imageUpload.secure_url

    const doctorData={
        name,
        email,
        image:imageUrl,
        password:hashedPassord,
        speciality,
        degree,
        experience,
        about,
        fees,
        address:JSON.parse(address),
        date:Date.now()
    }

    const newDoctor=new doctorsModel(doctorData)
    await newDoctor.save()

    res.json({success:true,message:"doctor added"})






}
    catch(error){

        console.log(error)
        res.json({success:false,message:error.message})

    }
}

const loginAdmin=async(req,res)=>{
    try{
        const {email,password}=req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token=jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true,token})


        }
        else{
            res.json({success:false,message:"Invalid Credentials"})
        }

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }

}

const allDoctors=async(req,res)=>{

    try {
        const doctors=await doctorsModel.find({}).select('-password')
        res.json({success:true,doctors})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})

        
    }

}

export{addDoctor,loginAdmin,allDoctors}