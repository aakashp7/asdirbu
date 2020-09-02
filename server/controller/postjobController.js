var formidable 				= require('formidable');
var fs 						= require('fs');
var md5 					= require('md5');
var path                	= require('path');
var dateFormat 				= require('dateformat');
const Mail           		= require('../model/mail');
const Postjobs 				= require('../model/postjob');
const Users 				= require('../model/users');
const userCtrl 	= require('./userController');
const imagePublicPath   	= path.join(__dirname, '../public/images/');
const tempImagePath   = path.join(__dirname, '../public/temp_image/');
var postjobController 		= {};

const url = "";
//const url = "";

postjobController.getUserList = async function(distance,currentLatitude,currentLongitude,job_type,serviceName,specialty,otherServiceName,otherSpecialty){
	return await Postjobs.getUserListBylatlong(distance,currentLatitude,currentLongitude,job_type,serviceName,specialty,otherServiceName,otherSpecialty);	
}
postjobController.getUserById = async function(userid){
	return await Postjobs.getUserListByid(userid);
}

postjobController.createjob = async function (req, res) { 
	var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) =>{
    	//Register Value
	    let email           = fields.email;
	    let password        = fields.password;
	    let name            = fields.name;
	    let lastname        = fields.lastname;
	    let service         = "";
	    let dob             = fields.dob;
	    //job Data
	    let paslaugos_priemimo_laikas 	= fields.paslaugos_priemimo_laikas ? fields.paslaugos_priemimo_laikas : '';
	    let latitude 	= fields.latitude ? fields.latitude : '';
	    let longitude 	= fields.longitude ? fields.longitude : '';
	    let skelbimo_pavadinimas 	= fields.skelbimo_pavadinimas ? fields.skelbimo_pavadinimas : '';
		let papasakok_plačiau 		= fields.papasakok_placiau ? fields.papasakok_placiau : '';
		let Raktažodžiai 			= fields.Raktažodžiai ? fields.Raktažodžiai : '';
		let paslaugos_kaina 		= fields.paslaugos_kaina ? fields.paslaugos_kaina : 0;
		let paslaugos_suteikimo_vieta= fields.paslaugos_suteikimo_vieta ? fields.paslaugos_suteikimo_vieta : '';
		let distance 				= fields.distance ? parseInt(fields.distance) : '';
		let paslaugos_priėmimo_vieta= fields.paslaugos_priėmimo_vieta ? fields.paslaugos_priėmimo_vieta : '';
		let job_type 				= fields.job_type ? fields.job_type : '';
	    let currentLongitude		= fields.currentLongitude ? fields.currentLongitude : 0;
		let currentLatitude 		= fields.currentLatitude ? fields.currentLatitude : 0;
		let serviceName 			= fields.serviceName ? fields.serviceName : '';
		let otherServiceName 		= fields.otherServiceName ? fields.otherServiceName : '';
		let specialty 				= fields.specialty ? fields.specialty : '';
		let otherSpecialty 			= fields.otherSpecialty ? fields.otherSpecialty : '';
		let placeGoodsDelivery 		= fields.placeGoodsDelivery ? fields.placeGoodsDelivery : '';
		let pridėk_nuotrauką 		= [];
		let userList = [];
		if(job_type){
			if (job_type == 1) {
				/*if (!paslaugos_kaina) {
					return res.status(200).send({success:false,message:"Prašome įvesti paslaugų kainą"});
				}*/
				if (!paslaugos_suteikimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų suteikimo vietą"});
				}
				if (!distance) {
					return res.status(200).send({success:false,message:"Įveskite atstumą"});
				}
				if (!paslaugos_priėmimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų priėmimo vietą"});
				}
			}
			else{
				if (!skelbimo_pavadinimas) {
					return res.status(200).send({success:false,message:"Įveskite skelbimo pavadinimą"});
				}
				if (!papasakok_plačiau) {
					return res.status(200).send({success:false,message:"Prašome įvesti papasakok plačiau"});
				}
				/*if (!Raktažodžiai) {
					return res.status(200).send({success:false,message:"Prašome įvesti Raktažodžius"});
				}*/
				/*if (!paslaugos_kaina) {
					return res.status(200).send({success:false,message:"Prašome įvesti paslaugų kainą"});
				}*/
				if (!paslaugos_suteikimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų suteikimo vietą"});
				}
				if (!distance) {
					return res.status(200).send({success:false,message:"Įveskite atstumą"});
				}
				if (!paslaugos_priėmimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų priėmimo vietą"});
				}
			}
		}
		else{
			return res.status(200).send({success:false,message:"Reikalingas darbo tipas"});
		}

	    if(!email){
	        return res.status(200).send({success:false,message:"Įveskite el. Pašto adresą"});
	    }
	    if(!password){
	        return res.status(200).send({success:false,message:"Įveskite slaptažodį"});
	    }
	    if(!name){
           return  res.status(200).send({success:false,message:"Įveskite vardą"});
        }
	    if(!lastname){
           return  res.status(200).send({success:false,message:"Pavardės laukas yra būtinas"});
        }/*
        if(!service){
           return  res.status(200).send({success:false,message:"Prašome įvesti paslaugą"});
        }*/
        if(!dob){
           return  res.status(200).send({success:false,message:"Įveskite gimimo datą"});
        }
        /*if (!Number.isInteger(paslaugos_kaina)) {
        	return  res.status(200).send({success:false,message:"Paslaugų kaina turi būti skaičius"});
        }*/
        if (!Number.isInteger(distance)) {
        	return  res.status(200).send({success:false,message:"Atstumas turi būti skaičius"});
        }

        if(paslaugos_priėmimo_vieta!=""){
        	paslaugos_priėmimo_vieta = dateFormat(paslaugos_priėmimo_vieta,"yyyy-mm-dd");
        }
		if(distance!=0 && latitude!=0 && longitude!=0){
			postjobController.getUserList(distance,latitude,longitude,job_type,serviceName,specialty,otherServiceName,otherSpecialty).then(response=>{
				userList = response;
				console.log(userList,"UserList");
			});
		}
		
		let fromUserId = 0;
	    skelbimo_pavadinimas = skelbimo_pavadinimas === "undefined" ? "" : skelbimo_pavadinimas; 
	    placeGoodsDelivery = placeGoodsDelivery === "undefined" ? "" : placeGoodsDelivery; 
        papasakok_plačiau = papasakok_plačiau === "undefined" ? "" : papasakok_plačiau; 
        Raktažodžiai = Raktažodžiai === "undefined" ? "" : Raktažodžiai; 
		
	    Users.isEmailUniue(email).then(result=>{
	        if(result.length > 0){
	            return res.status(200).send({success:false,message:"El. Paštas jau registruotas"});
	        }
	        else{
	            password = md5(password);
	            Users.registerIndividual(name,service,dob,1,email,password,lastname)
                    .then(result=>{
                    	//console.log(result);
                    if(result){
                    	fromUserid = result.insertId;
                    	Mail.activationMail(email,result.insertId);
						Object.keys(files).forEach(element=>{
				        	let image = new Date().getTime() + Math.floor(Math.random() * Math.floor(100)) + files[element].name;
					       	let oldpath = files[element].path;
					      	let newpath = tempImagePath + image;
					      	pridėk_nuotrauką.push(image);
					       	fs.rename(oldpath, newpath,(err)=>{});
				        	userCtrl.compressImage(newpath,imagePublicPath);
				        });
				        pridėk_nuotrauką = JSON.stringify(pridėk_nuotrauką);
						Postjobs.createjob(result.insertId,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,pridėk_nuotrauką,paslaugos_priėmimo_vieta,job_type,paslaugos_priemimo_laikas,latitude,longitude,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery).then(result=>{
					    	if(result){
					    		Mail.sendMailToPostJobUser(email,name,service,paslaugos_priemimo_laikas,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,paslaugos_priėmimo_vieta,job_type,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery);
					    		if(userList){
					    			userList.forEach((element,index)=>{
								//		Postjobs.storeNearestUser(fromUserid,element.id,result.insertId).then(result=>{console.log(result);});		
					    				Mail.jobPostMailToUser(element.email,email,name,service,paslaugos_priemimo_laikas,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,paslaugos_priėmimo_vieta,result.insertId,element.id,job_type,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery);	
						   			});
					    		}
					    		res.status(200).send({success:true,message:"Darbas buvo sukurtas sėkmingai"});
					    	}	
					        else{
					    		res.status(500).send({success:false,message:"Kažkas negerai"});
					    	}	
					    });
                    }   
                    else{
                    	//console.log("Demo");
                       res.status(500).send({success:false,message:"Kažkas negerai"});
                    }   
                });
	        }
	    });
	});
}


postjobController.postjob = function(req,res){
	var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

	    let paslaugos_priemimo_laikas 	= fields.paslaugos_priemimo_laikas ? fields.paslaugos_priemimo_laikas : '';
	    let latitude 	= fields.latitude ? fields.latitude : '';
	    let longitude 	= fields.longitude ? fields.longitude : '';
	    let email = "";
	    let username = "";
	    let service = "";
	  	let skelbimo_pavadinimas 	= fields.skelbimo_pavadinimas ? fields.skelbimo_pavadinimas : '';
		let papasakok_plačiau 		= fields.papasakok_placiau ? fields.papasakok_placiau : '';
		let Raktažodžiai 			= fields.Raktažodžiai ? fields.Raktažodžiai : '';
		let paslaugos_kaina 		= fields.paslaugos_kaina ? fields.paslaugos_kaina : 0;
		let paslaugos_suteikimo_vieta= fields.paslaugos_suteikimo_vieta ? fields.paslaugos_suteikimo_vieta : '';
		let distance 				= fields.distance ? parseInt(fields.distance) : '';
		let paslaugos_priėmimo_vieta= fields.paslaugos_priėmimo_vieta ? fields.paslaugos_priėmimo_vieta : '';
		let job_type 				= fields.job_type ? fields.job_type : '';
		let currentLongitude		= fields.currentLongitude ? fields.currentLongitude : 0;
		let currentLatitude 		= fields.currentLatitude ? fields.currentLatitude : 0;
		let serviceName 			= fields.serviceName ? fields.serviceName : '';
		let otherServiceName 			= fields.otherServiceName ? fields.otherServiceName : '';
		let specialty 				= fields.specialty ? fields.specialty : '';
		let otherSpecialty 			= fields.otherSpecialty ? fields.otherSpecialty : '';
		let placeGoodsDelivery 		= fields.placeGoodsDelivery ? fields.placeGoodsDelivery : '';
		let userList = [];
		let pridėk_nuotrauką 		= [];
		let user = [];
		postjobController.getUserById(req.id).then(user=>{
			email = (user[0].email) ? user[0].email : "";
			username = (user[0].name) ? user[0].name : "";
			service = (user[0].service) ? user[0].service : "";	
		});
		if(job_type){
			if (job_type == 1) {
			/*	if (!paslaugos_kaina) {
					return res.status(200).send({success:false,message:"Prašome įvesti paslaugų kainą"});
				}*/
				if (!paslaugos_suteikimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų suteikimo vietą"});
				}
				if (!distance) {
					return res.status(200).send({success:false,message:"Įveskite atstumą"});
				}
				if (!paslaugos_priėmimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų priėmimo vietą"});
				}
			}
			else{
				if (!skelbimo_pavadinimas) {
					return res.status(200).send({success:false,message:"Įveskite skelbimo pavadinimą"});
				}
				if (!papasakok_plačiau) {
					return res.status(200).send({success:false,message:"Prašome įvesti papasakok plačiau"});
				}
				/*if (!Raktažodžiai) {
					return res.status(200).send({success:false,message:"Prašome įvesti Raktažodžius"});
				}*/
				/*if (!paslaugos_kaina) {
					return res.status(200).send({success:false,message:"Prašome įvesti paslaugų kainą"});
				}*/
				if (!paslaugos_suteikimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų suteikimo vietą"});
				}
				if (!distance) {
					return res.status(200).send({success:false,message:"Įveskite atstumą"});
				}
				if (!paslaugos_priėmimo_vieta) {
					return res.status(200).send({success:false,message:"Įveskite paslaugų priėmimo vietą"});
				}
			}
		}
		else{
			return res.status(200).send({success:false,message:"Reikalingas darbo tipas"});
		}
		if(distance!=0 && latitude!=0 && longitude!=0){
			postjobController.getUserList(distance,latitude,longitude,job_type,serviceName,specialty,otherServiceName,otherSpecialty).then(response=>{
				userList = response;
				console.log(userList,"UserList");
			});
		}
		Object.keys(files).forEach(element=>{
        	let image = new Date().getTime()+ Math.floor(Math.random() * Math.floor(100)) + files[element].name;
	       	let oldpath = files[element].path;
	      	let newpath = tempImagePath + image;
	      	pridėk_nuotrauką.push(image);
	       	fs.rename(oldpath, newpath,(err)=>{});
	       	userCtrl.compressImage(newpath,imagePublicPath);
        });
        pridėk_nuotrauką = JSON.stringify(pridėk_nuotrauką);		
        if(paslaugos_priėmimo_vieta!="") {
        	paslaugos_priėmimo_vieta = dateFormat(paslaugos_priėmimo_vieta,"yyyy-mm-dd");
        }

        skelbimo_pavadinimas = skelbimo_pavadinimas === "undefined" ? "" : skelbimo_pavadinimas; 
        placeGoodsDelivery = placeGoodsDelivery === "undefined" ? "" : placeGoodsDelivery; 
        papasakok_plačiau = papasakok_plačiau === "undefined" ? "" : papasakok_plačiau; 
        Raktažodžiai = Raktažodžiai === "undefined" ? "" : Raktažodžiai; 
		Postjobs.createjob(req.id,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,pridėk_nuotrauką,paslaugos_priėmimo_vieta,job_type,paslaugos_priemimo_laikas,latitude,longitude,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery).then(result=>{
	    	if(result){
				if(userList){
					Mail.sendMailToPostJobUser(email,username,service,paslaugos_priemimo_laikas,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,paslaugos_priėmimo_vieta,job_type,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery);    		
					userList.forEach((element,index)=>{
						if(element.email != email){
							//Postjobs.storeNearestUser(req.id,element.id,result.insertId).then(result=>{console.log(result);});		
							Mail.jobPostMailToUser(element.email,email,username,service,paslaugos_priemimo_laikas,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,paslaugos_priėmimo_vieta,result.insertId,element.id,job_type,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery);	
						}
					});
				}
	    		res.status(200).send({success:true,message:"Darbas buvo sukurtas sėkmingai"});
	    	}	
	        else{
	    		res.status(500).send({success:false,message:"Kažkas negerai"});
	    	}	
	    });
    });
}
postjobController.storeMessageByJobId =  async function(req,res){
	try{
		if (!req.body.jobId) {
			return res.status(200).send({success:false,message:"Įveskite darbo id"});
		}
		if (!req.body.userId) {
			return res.status(200).send({success:false,message:"Įveskite vartotojo id"});
		}
		let jobId = req.body.jobId;
		let userId = req.body.userId;
		Postjobs.getJobDetailsById(jobId).then(response=>{
			if(response.length > 0) {
				let element = response[0];
				let link = url + element.id + "/" + userId; 
				let checkMessageStore = false;
				Postjobs.checkMessageStore(element.user_id,userId,jobId).then(result=>{
					console.log(result);
					if(!(result.length>0)){
						Postjobs.storeNearestUser(element.user_id,userId,jobId).then(result=>{console.log(result)});
						let serviceName = element.serviceName == 'Kita' ? element.otherServiceName : element.serviceName;
						let specialty = element.specialty == 'Kitas' ? element.otherSpecialty : element.specialty;
						let message = `<html><body><table style=" border: none !important; width:100%"><tr><th>Vardas : </th><th>${element.name}</th></tr><tr><th>Paslaugos priemimo laikas : </th><th>${element.paslaugos_priemimo_laikas}</th></tr><tr><th>Skelbimo pavadinimas : </th><th>${element.skelbimo_pavadinimas}</th></tr>`;
						if(element.job_type==1){
							message += `<tr><th>Papasakok plačiau : </th><th>${element.papasakok_plačiau}</th></tr><tr><tr><th>Pasirink paslaugą : </th><th>${serviceName}</th></tr><tr><th>Pasirink specialybe : </th><th>${specialty}</th></tr>`;
						}
						message +=`<tr><th>Paslaugos kaina : </th><th>${element.paslaugos_kaina}</th></tr><tr><th>Paslaugos priėmimo data : </th><th>${element.paslaugos_priėmimo_vieta}</th></tr><tr><th>Paslaugos suteikimo vieta : </th><th>${element.paslaugos_suteikimo_vieta}</th></tr><tr><th>Atstumas : </th><th>${element.distance}</th></tr><tr><th colspan="2" style="text-align:center;"><br/><a href="${link}" class='custom-button btn'>Mokėti ${element.paslaugos_kaina}EUR</a></th></tr></table></body></html>`;
						Postjobs.storeMessage(element.user_id,userId,message).then(response=>{
							if(response) {
								return res.status(200).send({success:true,message:"Sėkmingai išsaugoti pranešimą"});
							}
							else {
								return res.status(200).send({success:false,message:"Kažkas negerai"});
							}	
						});
					}
					else{
						return res.status(200).send({success:true,message:"Sėkmingai išsaugoti pranešimą"});
					}
				});
			}
			else {
				return res.status(200).send({success:false,message:"Kažkas negerai"});
			}
		});	
	}
	catch(error){
		return res.status(500).send({success:false,message:"Kažkas negerai"});
	}	
}



postjobController.getUserDetailsByJobId = async function(req,res){
	var mediaUrl = req.protocol+"://"+req.headers.host+'/media/';
	try{
		if (!req.body.jobId) {
			return res.status(200).send({success:false,message:"Įveskite darbo id"});
		}
		if (!req.body.userId) {
			return res.status(200).send({success:false,message:"Įveskite vartotojo id"});
		}
		let jobId = req.body.jobId;
		let userId = req.body.userId;
		let userAverageRating = await Users.getUserAvgRatings(userId).then(rates => {
			let rating = 0;
			if(rates.length) {
				rating =rates[0].rating;
			}
			return rating;
		});
		let serive_price = await Postjobs.getUserDetailsByJobId(jobId).then(result=>{
			let price = 0;
			if(result.length > 0) {
				price = result[0].paslaugos_kaina;
			}
			return price;
		});
		let userdetails = await Postjobs.getUserDetailsById(userId).then(result=>{
			let userdetails = {};
			if(result.length > 0) {
				userdetails = result[0];
			}
			return userdetails;
		});
		let taxPay = 0;
		let totalPrice = 0;
		serive_price = Number(serive_price).toFixed(2);
		let fees = Number((serive_price * 15) / 100).toFixed(2);
		let feesamount = Number(Number(serive_price) + Number(fees));
		if(userdetails.taxPay) {
			taxPay = Number((feesamount * 21) / 100).toFixed(2);
			totalPrice = Number(Number(serive_price) + Number(fees) + Number(taxPay)).toFixed(2);
		}
		else {
			taxPay = Number((fees * 21) / 100).toFixed(2);
			totalPrice = Number(Number(serive_price) + Number(fees) + Number(taxPay)).toFixed(2);
		}
		let data = {
			profile_image : userdetails.profile_image ? (mediaUrl + userdetails.profile_image) : (mediaUrl + "user.png"),
			name : userdetails.name ?  userdetails.name : "",
			ratings : userAverageRating ? userAverageRating : 0,
			termCondition : "N/A",
			city : userdetails.city ? userdetails.city : " - ",
			day : " - ",
			work : userdetails.service ? userdetails.service : '',
			service_name : userdetails.service ? userdetails.service : "",
			fee : fees,
			service_price : serive_price,
			price : totalPrice,
			totalHour : " - ",
			taxPay : taxPay
		};
		return res.status(200).send({success:true,message:"Sėkmingai gaukite vartotojo informaciją",data:data});
	}
	catch(error){
		console.log(error);
		return res.status(200).send({success:false,message:"Kažkas negerai"});	
	}	
}

postjobController.getJobDetailsById = async function(req,res){
	var mediaUrl = req.protocol+"://"+req.headers.host+'/media/';
	try{
		if (!req.body.jobId) {
			return res.status(200).send({success:false,message:"Įveskite darbo id"});
		}
		Postjobs.getJobDetailsById(req.body.jobId).then(result=>{
			if(result.length > 0){
				let image = mediaUrl + 'default-job-image.svg';
				let jobImage = [];
				if(result[0]["pridėk_nuotrauką"] != ""){
					let documentImage = JSON.parse(result[0]["pridėk_nuotrauką"]);
					if(documentImage.length > 0){
						image = mediaUrl + documentImage[0];
						documentImage.forEach(element=>{
							jobImage.push(mediaUrl + element);
						});
					}
				}
				let data = {
					image:image,
					address:result[0].paslaugos_suteikimo_vieta ? result[0].paslaugos_suteikimo_vieta : "",
					date:result[0].paslaugos_priėmimo_vieta ? dateFormat(result[0].paslaugos_priėmimo_vieta,"mm.dd.yyyy") : "",
					time:result[0].paslaugos_priemimo_laikas ? result[0].paslaugos_priemimo_laikas : "",
					jobTitle:result[0].skelbimo_pavadinimas ? result[0].skelbimo_pavadinimas : "",
					jobDescription:result[0].papasakok_plačiau ? result[0].papasakok_plačiau  : "",
					servicePrice:result[0].paslaugos_kaina ? result[0].paslaugos_kaina  : 0,
					jobImage:jobImage,
					jobType:result[0].job_type,
					userId:result[0].user_id
				};				
				return res.status(200).send({success:true,message:"Sėkmingai gaukite vartotojo informaciją",data:data});
			}
			else {
				return res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});	
			}
		});
	}
	catch(error){
		console.log(error);
		return res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});	
	}	
}


postjobController.sendMessagePostJobUser = async function(req,res){
	var mediaUrl = req.protocol+"://"+req.headers.host+'/media/';
	console.log(req.id,"===========---");
	try{
		if (!req.body.jobId) {
			return res.status(200).send({success:false,message:"Įveskite darbo id"});
		}
		Postjobs.getJobDetailsById(req.body.jobId).then(result=>{
			if(result.length > 0){
				Mail.sendMessagePostJobUser(result[0].email,req.id);
				return res.status(200).send({success:true,message:"Sėkmingai išsiųsti"});	
			}
			else{
				return res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});		
			}
		});	
	}
	catch(error){
		console.log(error);
		return res.status(200).send({success:false,message:"Kažkas negerai"});	
	}	
}
module.exports = postjobController;

