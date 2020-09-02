var dateFormat 			= require('dateformat');
var session             = require('express-session');
const Users             = require('../model/users');
const Booking           = require('../model/booking');
const keyPublishable 	= '';
const keySecret 		= '';
//const keyPublishable 	= '';
//const keySecret 		= '';
const stripe 			= require("stripe")(keySecret);
var bookingController   = {};
const Mail           	= require('../model/mail');


bookingController.storeBooking = function(req,res){
	if(!req.body.booked_user_id){
		return res.status(200).send({success:true,message:'Būtina užsakyti vartotojo ID!'})
	}
	let userHireType  = 0;
	if(req.body.userHireId!=0){
		userHireType = 1;
	}
	Booking.storeBooking(req.id,req.body.booked_user_id,req.body.tnx_id,req.body.userHireId,'paypal',req.body.totalAmount,req.body.fees,userHireType,req.body.jobId).then(result =>{
		if (result) {
	        var json =  JSON.parse(JSON.stringify(result));
			return res.status(200).send({success:true,message:'Rezervacija sėkmingai',bookingId: json.insertId});
		}
		else{
			return res.status(500).send({success:false,message:'Kažkas negerai!'});
		}
	});
}
bookingController.storeBookingMessage = async function(req,res){
	if(!req.body.bookingId){
		return res.status(200).send({success:true,message:'Reikalingas užsakymo ID!'});
	}
	let bookingId = req.body.bookingId;
	let message = req.body.message;
	Booking.getBookingDetailById(bookingId).then(response =>{
		if(response){
			let data = response[0];
			Booking.storeMessage(data.user_id,data.booked_user_id,message).then(response=>console.log(response));
		}
	});
	
			let bookingResult = await Booking.getBookingById(bookingId).then(bookingResult => {
				return bookingResult ? bookingResult[0] : [];
			});
			if (bookingResult) {
				let hireId = bookingResult.hire_id ? bookingResult.hire_id : 0;
				
				let day =  await Booking.getUserHireDayByid(hireId).then(result => {
					if(result.length > 0){
						result = JSON.parse(result[0].dates);
						let tempDats = '';
						if(result.length == 1){
							tempDats = dateFormat(result[0].date, "dd, mmmm");
						}
						else{
							let minDate = result[0].date;
							let maxDate = result[0].date;
							result.forEach(element =>{
								maxDate = element.date > maxDate ? element.date : maxDate;
								minDate = element.date < minDate ? element.date : minDate;
							});
							tempDats = dateFormat(minDate, "dd, mmmm")+' - '+dateFormat(maxDate, "dd, mmmm");
						}
						return tempDats;
					}
					else{
						return 0;
					}
				});
				
				let totalTime = await Booking.getUserHireDayByid(hireId).then(days =>{
					if(days.length>0){
					result = days[0].dates;
					let jsonResult = JSON.parse(result);
					let tempTotalTime = 0;
					jsonResult.forEach(async (element) => {
						let startTime = element.start.split("::");
						let endTime = element.end.split("::");
						let startDateTime = new Date();
						let endDateTime = new Date();
						startDateTime.setHours(startTime[0],startTime[1]);	
						endDateTime.setHours(endTime[0],endTime[1]);	
						let dif = ( endDateTime - startDateTime ) / 1000 / 60 / 60;
						tempTotalTime += dif;
					});
						return tempTotalTime;
					}
					else{
						return 0;
					}
				});
				console.log("req.body.user_id",req.body.user_id);
				let price = await Users.getUserById(req.body.user_id).then(userRes =>{        
					return userRes[0].hourrate ? userRes[0].hourrate : 0;
				});
				let companyUser =  await Users.getUserById(req.id).then(result =>{
					return result ? result[0] : [];
				});
				let devloperUser = await Users.getUserById(req.body.user_id).then(result =>{
					return result ? result[0] : [];
				});
				if(bookingResult.userHireType==1){
					Mail.sendMailToDeveloper(companyUser,devloperUser,day,totalTime,price);
					Mail.sendMailToCompany(companyUser,devloperUser,day,totalTime,price);
				}
				else {
					Mail.sendMailToDeveloperDirectHire(companyUser,devloperUser,bookingResult);
					Mail.sendMailToCompanyDirectHire(companyUser,devloperUser,bookingResult);
				}
			}	
			Booking.storeBookingMessage(bookingId,message).then(result =>{
		if (result) {			
			return res.status(200).send({success:true,message:'Užsakymo pranešimas sėkmingai išsaugotas'});
		}
		else{
			return res.status(500).send({success:false,message:'Kažkas negerai!'});
		}
	});
}
bookingController.storeUserHireDay = function(req,res){
	if(!req.body.userid){
		return res.status(200).send({success:false,message:'Pasirinkta data reikalinga!'})
	}
	if(!req.body.selectedDate){
		return res.status(200).send({success:false,message:'Pasirinkta data reikalinga!'})
	}
	if(!req.body.selectedDate.length){
		return res.status(200).send({success:false,message:'Pasirinkta data reikalinga!'})
	}
	const userId = req.body.userid;
	const selectedDate = req.body.selectedDate;
	let dateExist = [];
	let idList = [];
	let user = {};
	let timeSheet = [];
	let hireDates = [];
	let errorMessage = "";
	let options = {
        day: "numeric",
        month: "long"
    };
	Booking.getUserDetailsById(userId).then(response=>{
		if(response) {
			user = response[0];
		}
	});
	Booking.getTimeSheetByUserId(userId).then(response=>{
		if(response) {
			response.forEach(element=>{
				timeSheet.push({date:element.date,start:element.start,end:element.end});
			});
		}
	});

	let userHired = 0;
	Booking.getAllHireList().then(result=>{
		if(result){
			selectedDate.forEach((datelist,index)=>{
				result.forEach((ele)=>{
					const array = JSON.parse(ele.dates);
					array.forEach(element=> {
						if(datelist.date == element.date && ((datelist.start >=element.start && datelist.start < element.end) || (datelist.end > element.start && datelist.end < element.end))){
							if(hireDates[element.date]){
								hireDates[element.date].push({"id":ele.id,"isHired":ele.isHired,"date":element.date,"start":element.start,"end":element.end});
							}
							else{
								hireDates[element.date] = []; 
								hireDates[element.date].push({"id":ele.id,"isHired":ele.isHired,"date":element.date,"start":element.start,"end":element.end});
							}
							if(ele.isHired) {
								userHired = 1;
							}
						}
					});
				});
			});
			console.log(hireDates);
			if(userHired){
				for(const index in hireDates){	
					const timeSheetDetails = timeSheet.find(element=>element.date==hireDates[index][0].date);
					const availableStartTime = timeSheetDetails.start.split("::");
					const availableEndTime = timeSheetDetails.end.split("::");
					const tempDats = new Date(timeSheetDetails.date).toLocaleDateString("lt", options);
					errorMessage += user.name + " gali dirbti " + tempDats + " nuo " + availableStartTime[0] + ":" + availableStartTime[1] +  " į " + availableEndTime[0] + ":" + availableEndTime[1] + " tačiau turi užsakymą nuo ";
					hireDates[index].forEach((element,index)=>{
						if(element.isHired) {
							let selectedStartTime = element.start.split("::");
							let selectedEndTime = element.end.split("::");
							errorMessage +=  selectedStartTime[0] + ":" + selectedStartTime[1] + " iki " + selectedEndTime[0] + ":" + selectedEndTime[1] + ",";	
						}		
					});	
				}
				return res.status(200).send({success:false,message:errorMessage});
			}
			else{
				Booking.storeUserHireDay(JSON.stringify(req.body.selectedDate)).then(result => {
					if (result) {
						return res.status(200).send({success:true,message:'Nuoma dieną sėkmingai išsaugokites',userHireId:result.insertId });
					}
					else{
						return res.status(500).send({success:false,message:'Kažkas negerai!'});
					}
				});		
			}
			
		}
	});	
}
bookingController.stripePayment = async function(req,res){
	if(!req.body.stripeToken){
		return res.status(200).send({success:false,message:"Įveskite juostos žetoną"});
	}
	if(!req.body.amount){
		return res.status(200).send({success:false,message:"Įveskite sumą"});
	}
	if(!req.body.fees){
		return res.status(200).send({success:false,message:"Įveskite mokesčius"});
	}
	if(!req.body.userId){
		return res.status(200).send({success:false,message:"Įveskite vartotojo ID"});
	}
	let userHireType  = 0;
	if(req.body.userHireId!=0){
		userHireType = 1;
	}
	try{
	let user = await Users.getUserById(req.body.userId);
	let totalAmount = Number(req.body.amount).toFixed(2);
	let amount = Number(totalAmount * 100).toFixed(0);
	stripe.customers.create({
        email: user[0].email, 
        source: req.body.stripeToken
    })
    .then(customer =>
        stripe.charges.create({ // charge the customer
        amount,
        description: "Asdirub įkrovimas",
            currency: "eur",
            customer: customer.id
        }))
    .then(charge => {
    	console.log(charge);
    	if(charge.status=="succeeded"){
    		Booking.storeBooking(req.id,req.body.userId,charge.id,req.body.userHireId,'juostele',totalAmount,req.body.fees,userHireType,req.body.jobId).then(result =>{
				if (result) {
			        var json =  JSON.parse(JSON.stringify(result));
					return res.status(200).send({success:true,message:'Sėkmingai sumokėta',bookingId: json.insertId});
				}
				else{
					return res.status(500).send({success:false,message:'Kažkas negerai!'});
				}
			});
    	}
    	else{
			return res.status(200).send({success:false,message:"Kažkas negerai, bandykite vėliau dar kartą..."});
    	}
    }).catch(error=>{
    	return res.status(200).send({success:false,message:error.message});
    });
	}
	catch(error){
		console.log(error);
		return res.status(200).send({success:false,message:error.message});
	}
}
module.exports = bookingController;