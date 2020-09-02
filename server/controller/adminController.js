const Admin             = require('../model/admin');
const Users             = require('../model/users');
const Mail             = require('../model/mail');
const md5               = require('md5');
var jwtAuth             = require('../jwtAuth');
var path                = require('path');
var formidable          = require('formidable');
var fs                  = require('fs');
const userCtrl     = require('./userController');
const imagePublicPath       = path.join(__dirname, '../public/images/');
const tempImagePath   = path.join(__dirname, '../public/temp_image/');




var adminController = [];
adminController.login = async function(req,res){
    let email       = req.body.email;
    let password    = req.body.password;
    if(!email){
        return res.status(200).send({success:false,message:"Įveskite el. Pašto adresą"});
    }
    if(!password){
        return res.status(200).send({success:false,message:"Įveskite slaptažodį"});
    }
    password    = md5(req.body.password);
    Admin.login(email, password).then(results=>{
        if (results.length > 0) { 
            var string =JSON.stringify(results);
            var json =  JSON.parse(string);            
            jwtAuth.createToken(json[0].id).then(result=>{
               let data = {
                    id          : json[0].id, 
                    email       : json[0].email, 
                       name         : json[0].name,
                    _token      : result
                };
                res.status(200).send({success:true,message:"Prisijungimas sėkmingai!", data:data});
            });
            
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
        } 
    });
}
adminController.dashboard = async function(req, res){
    let totalUser        = await Admin.getTotalUserCount();
    let individualUser   = await Admin.getIndividualUserCount();
    let businessUser     = await Admin.getBusinessUserCount();
    let totalJob         = await Admin.getTotalJobCount();
    let payment          = await Admin.getTotalPayment();
    let data = {
        totalUsers      : totalUser[0].users,
        individualUsers : individualUser[0].users,
        businessUsers   : businessUser[0].users,
        totalJobs       : totalJob[0].jobs,
        totalEuro       : payment[0].totalEuro,
        feesEuro        : payment[0].feesEuro,
        employeesEuro   : payment[0].employeesEuro
    }
    res.status(200).send({success:true,message:"Duomenys gauti",data: data});
}

adminController.getUserListByType = async function(req,res){
    let userType       = req.body.userType;
    let userList = [];
    if(!userType){
        return res.status(200).send({success:false,message:"Įveskite vartotojo tipą"});
    }
    Admin.getUserListByType(userType).then(result=>{
        if (result.length > 0) { 
            result.forEach((element)=>{
                 userList.push({
                    id:element.id,    
                    name:element.name,    
                    email:element.email,    
                    mobileNumber:element.phone,    
                    hourlyRate:element.hourrate,
                    city:element.city,    
                    isApproved:element.isApproved,    
                    companyCode:element.companyCode,    
                    companyName:element.companyName    
                 });
            });
            res.status(200).send({success:true,message:"Sėkmingai gaukite vartotojų sąrašą", data:userList});
        } else {
            res.status(200).send({success:true,message:"Sėkmingai gaukite vartotojų sąrašą", data:userList});
        } 
    });
}

adminController.getUserDetailsById = async function(req,res){
    let mediaURL     = req.protocol+"://"+req.headers.host+'/media/';
    let userId       = req.body.userId;
    let documentFile = [];
    let timeSheet = [];
    if(!userId){
        return res.status(200).send({success:false,message:"Įveskite vartotojo ID"});
    }
    documentFile = await Admin.getDocumentById(userId).then(results=>{    
        let documentFileData = [];
        if(results.length>0){
            results.forEach(element=>{
                documentFileData.push({"documentFile":mediaURL + element.document,"documentName":element.name});
            });
        }
        return documentFileData;
    });
    timeSheet = await Admin.getTimeSheetDetailsById(userId).then(results=>{    
        let timeSheetdata = [];
        if(results.length>0){            
            results.forEach(element=>{
                timeSheetdata.push({"date":element.date,"start":element.start,"end":element.end});
            });
        }
        return timeSheetdata;
    }); 
    Admin.getUserDetailsById(userId).then(result=>{
        if (result.length > 0) { 
            let image = "";
            if(result[0].image !== "" && result[0].image !== null){
                image = JSON.parse(result[0].image);
            }
            let data = {
                id:result[0].id,    
                name:result[0].name,    
                lastname:result[0].last_name,    
                dob:result[0].dob,    
                houseNumber:result[0].houseNumber,    
                service:result[0].service,    
                type:result[0].type,    
                email:result[0].email,    
                mobileNumber:result[0].phone,    
                address:result[0].address,    
                city:result[0].city,    
                bankAccountNumber:result[0].bank_ac_no,
                documentFile:documentFile,   
                service:result[0].servie,
                aboutMe:result[0].about_me,
                hourRate:result[0].hourrate,
                timeSheet:timeSheet,
                isApproved:result[0].isApproved,
                userType:result[0].userType,
                images:image,    
                profileImage:(result[0].profile_image  && result[0].profile_image !== null) ? result[0].profile_image : "",    
                serviceName:result[0].serviceName === 'Kita' ? result[0].otherServiceName : result[0].serviceName,
                specialty:result[0].specialty === 'Kitas' ? result[0].otherSpecialty :  result[0].specialty,                    
                companyCode:(result[0].companyCode !==null && result[0].companyCode !== "") ? result[0].companyCode : "",    
                companyName:(result[0].companyName !==null && result[0].companyName !== "") ? result[0].companyName : ""
             };
            res.status(200).send({success:true,message:"Sėkmingai gaukite vartotojo informaciją", data:data});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
        } 
    });
}

adminController.deleteUserById = async function(req,res){
    let userId       = req.body.userId;
    if(!userId){
        return res.status(200).send({success:false,message:"Įveskite vartotojo ID"});
    }
    Admin.deleteUserById(userId).then(result=>{
        if (result) { 
            res.status(200).send({success:true,message:"Sėkmingas vartotojo ištrynimas"});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
        } 
    });
}

adminController.getQuickJobList = async function(req,res){
    let quickJobs = [];
    Admin.getQuickJobList().then(result=>{
        if (result.length > 0) { 
            result.forEach((element)=>{
                 quickJobs.push({
                    id:element.id,    
                    name:element.name,    
                    email:element.email,    
                    adName:element.skelbimo_pavadinimas,   
                    serviceAdmissionTime:element.paslaugos_priemimo_laikas,    
                    tellMore:element.papasakok_plačiau,   
                    keyword:element.Raktažodžiai,    
                    servicePrice:element.paslaugos_kaina,   
                    locationServicePrice:element.paslaugos_suteikimo_vieta,    
                    distance:element.distance,   
                    serivcePlace:element.paslaugos_priėmimo_vieta,    
                    jobType:element.job_type == 1 ? "Greitas darbas" : "Paimti/Pristatyti"    
                 });
            });
            res.status(200).send({success:true,message:"Sėkmingai sudaryti greitų darbų sąrašą", data:quickJobs});
        } else {
            res.status(200).send({success:true,message:"Sėkmingai sudaryti greitų darbų sąrašą", data:quickJobs});
        } 
    });
}


adminController.deleteQuickJobById = async function(req,res){
    let quickJobId       = req.body.quickJobId;
    if(!quickJobId){
        return res.status(200).send({success:false,message:"Įveskite greito darbo ID"});
    }
    Admin.deleteQuickJobById(quickJobId).then(result=>{
        if (result) { 
            res.status(200).send({success:true,message:"Sėkmingai ištrinti greitą darbą"});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
        } 
    });
}

adminController.getQuickJobDetailById = async function(req,res){
    let mediaURL     = req.protocol+"://"+req.headers.host+'/media/';
    let quickJobId   = req.body.quickJobId;
    if(!quickJobId){
        return res.status(200).send({success:false,message:"Įveskite greito darbo ID"});
    }
   Admin.getQuickJobDetailById(quickJobId).then(result=>{
        if (result.length > 0) { 
            let element = result[0];
            let images = [];
            if(element["pridėk_nuotrauką"]){
                let image = JSON.parse(element["pridėk_nuotrauką"]);
                  image.forEach(value=>{
                    images.push(mediaURL + value);
                });
            }          
            let quickJobs  = {
                id:element.id,    
                name:element.name,    
                email:element.email,    
                adName:element.skelbimo_pavadinimas,   
                serviceAdmissionTime:element.paslaugos_priemimo_laikas,    
                tellMore:element.papasakok_plačiau,   
                keyword:element.Raktažodžiai,    
                servicePrice:element.paslaugos_kaina,   
                locationServicePrice:element.paslaugos_suteikimo_vieta,    
                distance:element.distance,   
                serivcePlace:element.paslaugos_priėmimo_vieta,    
                jobType:element.job_type == 1 ? "Greitas darbas" : "Pavežti",    
                image:images,
                serviceName : element.serviceName == 'Kita' ? element.otherServiceName : (element.serviceName=="undefined" ? "" : element.serviceName),
                specialty : element.specialty == 'Kitas' ? element.otherSpecialty : (element.specialty=="undefined" ? "" : element.specialty)
            };
            res.status(200).send({success:true,message:"Sėkmingai sudaryti greitų darbų sąrašą", data:quickJobs});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
        } 
    });


}


adminController.getBlogList = async function(req,res){
    let blogList = [];
    let mediaURL     = req.protocol+"://"+req.headers.host+'/media/';
    Admin.getBlogList().then(result=>{
        if (result.length > 0) { 
            result.forEach((element)=>{
                 blogList.push({
                    id:element.id,    
                    name:element.name,    
                    image:mediaURL + element.image,    
                    description:element.description.replace( /(<([^>]+)>)/ig, '').substr(0,104) + "...",
                 });
            });
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:blogList});
        } else {
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:blogList});
        } 
    });
}


adminController.deleteBlogById = async function(req,res){
    let blogId       = req.body.blogId;
    if(!blogId){
        return res.status(200).send({success:false,message:"Įveskite tinklaraščio ID"});
    }
    Admin.deleteBlogById(blogId).then(result=>{
        if (result) { 
            res.status(200).send({success:true,message:"Sėkmingai ištrinti tinklaraštį"});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
        } 
    });
}

adminController.storeBlog = async function(req,res){
    let form = new formidable.IncomingForm();
    let image = "";
    let name = "";
    let description = "";
    form.parse(req, function (err, fields, files) {
        name     = fields.name;
        description     = fields.description;
        let image = new Date().getTime()+ Math.floor(Math.random() * Math.floor(100)) + files.image.name;
        let oldpath = files.image.path;
        let newpath = tempImagePath + image;
        fs.rename(oldpath, newpath,(err)=>{});
        userCtrl.compressImage(newpath,imagePublicPath);
        Admin.storeBlog(name,image,description).then(result=>{
            if (result) { 
                res.status(200).send({success:true,message:"Sėkmingai internetinė parduotuvė"});
            } else {
                res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
            } 
        });
    });
}
adminController.updateBlog = async function(req,res){
    let form = new formidable.IncomingForm();
    let image = "";
    let name = "";
    let description = "";
    let blogId = "";
    form.parse(req, function (err, fields, files) {
        name     = fields.name;
        description = fields.description;
        blogId = fields.blogId;
        if(files.image){
            image = new Date().getTime()+ Math.floor(Math.random() * Math.floor(100)) + files.image.name;
            let oldpath = files.image.path;
            let newpath = tempImagePath + image;
            fs.rename(oldpath, newpath,(err)=>{});
            userCtrl.compressImage(newpath,imagePublicPath);
        }
        Admin.updateBlog(name,image,description,blogId).then(result=>{
            if (result) { 
                res.status(200).send({success:true,message:"Sėkmingai internetinė parduotuvė"});
            } else {
                res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
            } 
        });
    });
}
adminController.getBlogDetailsById = async function(req,res){
    let blogId       = req.body.blogId;
    if(!blogId){
        return res.status(200).send({success:false,message:"Įveskite tinklaraščio ID"});
    }
    Admin.getBlogDetailsById(blogId).then(result=>{
        if (result.length>0) { 
            let element = result[0];
            let data = {"name":element.name,"description":element.description};    
            res.status(200).send({success:true,message:"sėkmingai gauti dienoraščio informaciją",data:data});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});
        } 
    });
}

adminController.getLatestBlog = async function(req,res){
    let blogList = [];
    let mediaURL     = req.protocol+"://"+req.headers.host+'/media/';
    Admin.getLatestBlog().then(result=>{
        if (result.length > 0) { 
            result.forEach((element)=>{
                 blogList.push({
                    id:element.id,    
                    name:element.name,    
                    image:mediaURL + element.image,    
                    description:element.description.replace( /(<([^>]+)>)/ig, '').substr(0,104) + "...",    
                 });
            });
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:blogList});
        } else {
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:blogList});
        } 
    });
}

adminController.getBlogById = async function(req,res){
    let blogId       = req.body.blogId;
    if(!blogId){
        return res.status(200).send({success:false,message:"Įveskite tinklaraščio ID"});
    }
    let mediaURL     = req.protocol+"://"+req.headers.host+'/media/';
    Admin.getBlogDetailsById(blogId).then(result=>{
        if (result.length > 0) { 
            element = result[0];
                let blog = {
                    id:element.id,    
                    name:element.name,    
                    image:mediaURL + element.image,    
                    description:element.description,    
                 }
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:blog});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});            
        } 
    });
}


adminController.getTransactionHistroy = async function(req,res) {
    let transactionHistroy = [];
    Admin.getTransactionHistroy().then(result=>{
        if (result.length > 0) { 
            result.forEach((element)=>{
                let fees = element.fees;    
                let servicePrice = Number((element.fees * 100) / 15).toFixed(2); 
                let charges =  Number((element.amount * 3)/100).toFixed(2); 
                let profit =Number(Number(element.amount - servicePrice) - charges).toFixed(2); 
                transactionHistroy.push({
                    id:element.id,    
                    date:element.date,    
                    clientName:element.clientName,    
                    developerName:element.developerName,    
                    amount:element.amount,    
                    servicePrice:servicePrice,
                    bankAccountNumber:element.bankAccountNumber,    
                    paymentType:element.paymentType,    
                    status:element.status,
                    isPaid:element.status==0 ? "Ne" : "Taip",
                    transctionId:element.transctionId,
                 	stripe:element.paymentType=="juostele" ? charges : "",
                 	paypal:element.paymentType=="paypal" ? charges : "",
                 	profilt:profit,
                 });
            });
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:transactionHistroy});
        } else {
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:transactionHistroy});
        } 
    });   
}
adminController.changeTransactionStatus = async function(req,res) {    
    let transctionId = req.body.transctionId;
    let status       = req.body.status;
    Admin.changeTransactionStatus(transctionId,status).then(result=>{
        if (result) {
            res.status(200).send({success:true,message:"Sėkmingai pakeiskite transliacijos būseną"});
        } else {
            res.status(200).send({success:false,message:"Neteisingas slaptažodis arba el paštas"});            
        } 
    });   
}

adminController.getTotalPayementByDate = async function(req, res){
    if(!req.body.startDate){
        res.status(200).send({success:false,message:"Įveskite pradžios datą"});            
    }     
    if(!req.body.endDate){
        res.status(200).send({success:false,message:"Įveskite pabaigos datą"});            
    }
    let businessUsers = await Admin.getTotalByDateUserType(req.body.startDate,req.body.endDate,2);
    let individualUsers = await Admin.getTotalByDateUserType(req.body.startDate,req.body.endDate,1);
    let totalJobs = await Admin.getTotalJobByDate(req.body.startDate,req.body.endDate);
    let payment  = await Admin.getTotalPayementByDate(req.body.startDate,req.body.endDate);
    let data = {
    	individualUsers : individualUsers[0] ? individualUsers[0].totalUser : 0,  
    	businessUsers  	: businessUsers[0] ? businessUsers[0].totalUser : 0,  
    	totalJobs  		: totalJobs[0] ? totalJobs[0].totalJobs : 0,  
        totalEuro       : payment[0] ? payment[0].totalEuro : 0,
        feesEuro        : payment[0] ? payment[0].feesEuro : 0,
        employeesEuro   : payment[0] ? payment[0].employeesEuro : 0
    }
    res.status(200).send({success:true,message:"Duomenys gauti",data: data});
}

adminController.getTransactionByDate = async function(req,res) {
    if(!req.body.startDate){
        res.status(200).send({success:false,message:"Įveskite pradžios datą"});
    } 
    if(!req.body.endDate){
        res.status(200).send({success:false,message:"Įveskite pabaigos datą"});
    }
    let transactionHistroy = [];
    Admin.getTransactionByDate(req.body.startDate,req.body.endDate).then(result=>{
        if (result.length > 0) { 
            result.forEach((element)=>{
                let fees = element.fees;    
                let servicePrice = Number((element.fees * 100) / 15).toFixed(2); 
                let charges =  Number((element.amount * 3)/100).toFixed(2); 
                let profit =Number(Number(element.amount - servicePrice) - charges).toFixed(2); 
                transactionHistroy.push({
                    id:element.id,    
                    date:element.date,    
                    clientName:element.clientName,    
                    developerName:element.developerName,    
                    amount:element.amount,    
                    servicePrice:servicePrice,
                    bankAccountNumber:element.bankAccountNumber,    
                    paymentType:element.paymentType,    
                    status:element.status,
                    isPaid:element.status==0 ? "Ne" : "Taip",
                    transctionId:element.transctionId,
                 	stripe:element.paymentType=="juostele" ? charges : "",
                 	paypal:element.paymentType=="paypal" ? charges : "",
                 	profilt:profit,
                 });
            });
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:transactionHistroy});
        } else {
            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:transactionHistroy});
        } 
    });   
}
adminController.updateUserStatus = async function(req,res) {
    if(!req.body.userId){
        res.status(200).send({success:false,message:"Reikalingas vartotojo ID"});
    } 
    let userId = req.body.userId;
    let isApproved = Number(req.body.isApproved);
    Admin.updateUserStatus(isApproved,userId).then(result=>{
        if (result) { 
            if(isApproved==1) {
                Users.getUserById(userId).then(result=>{
                    if(result.length > 0){
                        Mail.profileApproveMail(result[0].email); 
                    }
                });
            }    
            res.status(200).send({success:true,message:"Sėkmingai atnaujinti būseną"});
        } else {
            res.status(200).send({success:false,message:"Kažkas negerai"});
        } 
    });   
}
adminController.getAllBlog = function(req,res){
	try{
		let mediaURL     = req.protocol+"://"+req.headers.host+'/media/';
	    Admin.getAllBlog().then(result=>{
	        let blogList = [];
	        if (result.length > 0) { 
	            result.forEach(element=>{
	                blogList.push({
	                    id:element.id,    
	                    name:element.name,    
	                    image:mediaURL + element.image,    
	                    description:element.description.replace( /(<([^>]+)>)/ig, '').substr(0,104) + "...",    
	                });
	            });
	            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:blogList});
	        } else {
	            res.status(200).send({success:true,message:"Sėkmingai gaukite tinklaraščių sąrašą", data:blogList});
	        } 
	    });	
	}
	catch(error){
	    res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});
	}
}

adminController.updateProfileById = function(req,res){
    try
    {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let id                 = fields.userId;
            let name               = fields.name ? fields.name : "";
            let lastname           = fields.lastname ? fields.lastname : "";
            let email              = fields.email ? fields.email : "";
            let phone              = fields.phone ? fields.phone : "";
            let companyName        = fields.companyName ? fields.companyName : "";
            let companyCode        = fields.companyCode ? fields.companyCode : "";
            let dob                = fields.dob ? fields.dob : "";
            let hourrate           = fields.hourrate ? fields.hourrate : 0;
            let type               = fields.type ? fields.type : "";
            let serviceName        = fields.serviceName ? fields.serviceName : "";
            let specialty          = fields.specialty ? fields.specialty : "";
            let backAccountNumber  = fields.backAccountNumber ? fields.backAccountNumber : "";
            let service            = fields.service ? fields.service : "";
            let aboutMe            = fields.aboutMe ? fields.aboutMe : "";
            let address            = fields.address ? fields.address : "";
            let city               = fields.city ? fields.city : "";
            let houseNumber        = fields.houseNumber ? fields.houseNumber : "";
            let profileImage       = fields.profileImage ? fields.profileImage : "";
            let documentImage      = fields.documentImage ? fields.documentImage : "";
            let images             = fields.images ? fields.images : "";

            Users.isEmailUniue(email,id).then(result=>{
                if(result.length > 0) {
                    return res.status(200).send({success:false,message:"El. Paštas jau registruotas"});
                }
                else {
                    let imageList = [];
                    Object.keys(files).forEach(element=>{
                        if(element.startsWith("document")) {
                            Users.deleteDocumentByUserId(id);
                        }
                    });
                    Object.keys(files).forEach(element=>{
                        let image = new Date().getTime() + Math.floor(Math.random() * Math.floor(100)) + files[element].name;
                        let oldpath = files[element].path;
                        let temp_newpath = tempImagePath + image;
                        if(files[element].name){
                            if(element == 'profileImage') {
                                profileImage = image;
                            }
                            else if(element.startsWith("image")) {
                                imageList.push(image);
                            }
                            else {
                                Users.InsertUserDocument(id,image,files[element].name);
                            }
                            fs.rename(oldpath, temp_newpath,(err)=>{});
                            userCtrl.compressImage(temp_newpath,imagePublicPath);
                        }
                    });
                    console.log("Demo",images);
                    console.log("Demo",imageList);
                    if(imageList.length>0){
                        images = JSON.stringify(imageList);
                    }
                    Users.updateProfile(name,lastname,email,phone,companyName,companyCode,dob,hourrate,type,serviceName,specialty,backAccountNumber,service,aboutMe,address,city,houseNumber,profileImage,images,id).then((result)=>{
                        if (result) {
                            res.status(200).send({success:true,message:"Informacija atnaujinta sėkmingai"});
                        }else{
                            res.status(200).send({success:false,message:"Laukiama patvirtinimo"});
                        }                
                    });     
                }
            });
        });
    }
    catch(error){
        res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});
    }
}

adminController.addNewUser = function(req,res){
    try
    {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let name               = fields.name ? fields.name : "";
            let lastname           = fields.lastname ? fields.lastname : "";
            let email              = fields.email ? fields.email : "";
            let phone              = fields.phone ? fields.phone : "";
            let companyName        = fields.companyName ? fields.companyName : "";
            let companyCode        = fields.companyCode ? fields.companyCode : "";
            let dob                = fields.dob ? fields.dob : null;
            let hourrate           = fields.hourrate ? fields.hourrate : 0;
            let type               = fields.type ? fields.type : "";
            let serviceName        = fields.serviceName ? fields.serviceName : "";
            let specialty          = fields.specialty ? fields.specialty : "";
            let backAccountNumber  = fields.backAccountNumber ? fields.backAccountNumber : "";
            let service            = fields.service ? fields.service : "";
            let aboutMe            = fields.aboutMe ? fields.aboutMe : "";
            let address            = fields.address ? fields.address : "";
            let city               = fields.city ? fields.city : "";
            let houseNumber        = fields.houseNumber ? fields.houseNumber : "";
            let profileImage       = fields.profileImage ? fields.profileImage : "";
            let documentImage      = fields.documentImage ? fields.documentImage : "";
            let images             = fields.images ? fields.images : "";
            let password             = fields.password ? fields.password : "";
            let userType             = fields.userType ? fields.userType : "";
            Users.isEmailUniue(email,0).then(result=>{
                if(result.length > 0) {
                    return res.status(200).send({success:false,message:"El. Paštas jau registruotas"});
                }
                else {
                    let documentImageId = [];
                    let imageList = [];
                    Object.keys(files).forEach(element=>{
                        let image = new Date().getTime() + Math.floor(Math.random() * Math.floor(100)) + files[element].name;
                        let oldpath = files[element].path;
                        let temp_newpath = tempImagePath + image;
                        if(files[element].name){
                            if(element == 'profileImage') {
                                profileImage = image;
                            }
                            else if(element.startsWith("image")) {
                                imageList.push(image);
                            }
                            else {
                                Users.InsertUserDocument(0,image,files[element].name).then(result=>{
                                    if(result){
                                        documentImageId.push(result.insertId);
                                    }
                                });
                            }
                            fs.rename(oldpath, temp_newpath,(err)=>{});
                            userCtrl.compressImage(temp_newpath,imagePublicPath);
                        }
                    });
                    if(imageList.length>0){
                        images = JSON.stringify(imageList);
                    }
                    password = md5(password);
                    Users.addNewUser(name,lastname,email,phone,companyName,companyCode,dob,hourrate,type,serviceName,specialty,backAccountNumber,service,aboutMe,address,city,houseNumber,profileImage,images,password,userType).then((result)=>{
                        if (result) {
                            console.log(result);
                            if(documentImageId.length>0){
                                   Users.updateDocumentUserIdById(result.insertId,documentImageId);
                            }
                            res.status(200).send({success:true,message:"Informacija atnaujinta sėkmingai"});
                        }else{
                            res.status(200).send({success:false,message:"Laukiama patvirtinimo"});
                        }                
                    });     
                }
            });
        });
    }
    catch(error){
        res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});
    }
}


module.exports = adminController;