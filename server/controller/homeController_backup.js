var formidable          = require('formidable');
const Home 				= require('../model/home');
const Users 			= require('../model/users');
var homeController 		= {};
homeController.userData = async function(req,res){
	try{
		let mediaUlr = req.protocol+"://"+req.headers.host+'/media/';
		let jobPageOffset = 0;
		let topUserPageOffset = 0;
		let rateStartingFrom  = 0;
		let curruntUserId 	  = 0;
		if (req.body.user_id) {
			let result = await Users.getUserById(req.body.user_id);
			if (result.length) {
				if (result[0].userType == 1) {
					curruntUserId = req.body.user_id;
				}
			}
			else{
				curruntUserId = req.body.user_id;
			}
		}
		if(req.body.jobPage && req.body.jobPage > 0){
			jobPageOffset = (req.body.jobPage-1)*10;
		}
		if(req.body.newUserPage && req.body.newUserPage > 0){
			newUserPageOffset = (req.body.newUserPage-1)*10;
		}
		curruntUserId = req.body.user_id;
		/* Count User */
		let userCount 	= await Home.countNewUser(curruntUserId);
		let totalNewUserPage = Math.ceil(userCount[0].userCount/10);

		/* Count Job */
		let jobCount 	= await Home.countAllJob(curruntUserId);
		let totalJobPage = Math.ceil(jobCount[0].jobCount/10);
		
		
		let jobList = await Home.getAlljob(10,jobPageOffset,curruntUserId).then(result=>{
			let data = [];
			result.forEach(element =>{
				let totalRate = 0;
				let fees = 0;
				let taxFees = 0;
				let feesAmount = 0;
				if(element.hourrate){
					fees = Number((element.hourrate * 15 ) / 100);
					feesAmount = Number(Number(element.hourrate) + Number(fees));
					if(element.taxPay){
						taxFees = Number((feesAmount * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
					else {
						taxFees = Number((fees * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
				}
				if(element.name && element.name!="undefined"){
				let image = mediaUlr + 'default-job-image.svg';
				if(element.documentImage != ""){
					let documentImage = JSON.parse(element.documentImage);
					if(documentImage.length > 0){
						image = mediaUlr + documentImage[0];
					}
				}
				data.push({
					id		: element.id,
					service : "",
					otherServiceName:element.serviceName=='Kita' ? element.otherServiceName : element.serviceName,
					name 	: element.name,
					type    : "",
					image 	: image,
					rating  : 0,
					perHour : totalRate,
					lat		: element.latitude,
					long 	: element.longitude,
					isJob   : true
				});}
	    	});
	    	return data;
		});
		let newUserData = await Home.getNewUsers(10,newUserPageOffset,curruntUserId).then(result=>{
			let newUser = [];
			result.forEach(element =>{
				let image 	= element.profile_image ? mediaUlr+element.profile_image : mediaUlr+'user.png';
				let rating 	= element.user_rating ? element.user_rating : 0;
				let name 	= element.name ? (element.name + " "+ element.last_name) : element.companyName;
				let totalRate = 0;
				let fees = 0;
				let taxFees = 0;
				let feesAmount = 0;
				if(element.hourrate){
					fees = Number((element.hourrate * 15 ) / 100);
					feesAmount = Number(Number(element.hourrate) + Number(fees));
					if(element.taxPay){
						taxFees = Number((feesAmount * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
					else {
						taxFees = Number((fees * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
				}
				newUser.push({
					id		: element.id,
					service	: element.service,
					otherServiceName : element.serviceName=='Kita' ? element.otherServiceName : element.serviceName,
					name 	: name,
					type 	: element.type,
					image 	: image,
					rating 	: rating,
					perHour : totalRate,
					lat		: element.latitude,
					long 	: element.longitude,
					isJob   : false
				});
	    	});
	    	return newUser
		});
		/*let topUserData = await Home.getTopRatedUsers(10,topUserPageOffset,curruntUserId).then(result=>{
			let topUser = [];
			result.forEach(element=>{
				let image 	= element.profile_image ? mediaUlr+element.profile_image : mediaUlr+'user.png';
				let rating 	= element.user_rating ? element.user_rating : 0;
				let name 	= element.name ? element.name : element.companyName;
				let totalRate = 0;
				let fees = 0;
				let taxFees = 0;
				let feesAmount = 0;
				if(element.hourrate){
					fees = Number((element.hourrate * 15 ) / 100);
					feesAmount = Number(Number(element.hourrate) + Number(fees));
					if(element.taxPay){
						taxFees = Number((feesAmount * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
					else {
						taxFees = Number((fees * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
				}
				topUser.push({
						id		: element.id,
						service	: element.service,
						otherServiceName:element.serviceName=='Kita' ? element.otherServiceName : element.serviceName,
						type 	: element.type,
						name 	: name,
						last_name: element.last_name,
						image 	: image,
						rating 	: rating,
						perHour : totalRate,
						lat		: element.latitude,
						long 	: element.longitude,
						isJob   : false
					});
			});
			return topUser;
		});*/
		res.status(200).send({success:true,message:'Vartotojo duomenys buvo grąžinti',data:{jobList: jobList, newUser: newUserData, totalNewUserPage:totalNewUserPage,totalJobPage:totalJobPage}});
	}
	catch(error){
		res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});
	}
}

homeController.search = async function(req,res){
	try{
	let mediaUlr = req.protocol+"://"+req.headers.host+'/media/';
	let serviceName = '';
	let otherServiceName = '';
	let specialty = '';
	let otherSpecialty = '';
	let city	= '%%';
	let curruntUserId 	  = 0;
	if (req.body.user_id) {
		let result = await Users.getUserById(req.body.user_id);
		if (result.length) {
			if (result[0].userType == 1) {
				curruntUserId = req.body.user_id;
			}
		}
		else{
			curruntUserId = req.body.user_id;
		}
	}
	if(req.body.city){
		city = '%'+req.body.city+'%';
	}
	curruntUserId = req.body.user_id;
	serviceName = req.body.serviceName;
	otherServiceName = req.body.otherServiceName;
	specialty = req.body.specialty;
	otherSpecialty = req.body.otherSpecialty;
	
	/* Count User */
	let userCount 	= await Home.getSearchUsersCount(city,serviceName,otherServiceName,specialty,otherSpecialty,curruntUserId);
	let totalNewUserPage 	= Math.ceil(userCount[0].userCount/10);
	
	/* Count Job */
	let jobCount 	= await Home.getSearchJobCount(city,serviceName,otherServiceName,specialty,otherSpecialty,curruntUserId);
	let totalJobPage = Math.ceil(jobCount[0].jobCount/10);
		
	let newUserPageOffset = 0;
	let jobPageOffset = 0;
	
	if(req.body.newUserPage && req.body.newUserPage > 0){
		newUserPageOffset = (req.body.newUserPage-1)*10;
	}
	if(req.body.jobPage && req.body.jobPage > 0){
		jobPageOffset = (req.body.jobPage-1)*10;
	}
	let newUserData = await Home.getSearchNewUsers(city,serviceName,otherServiceName,specialty,otherSpecialty,10,newUserPageOffset,curruntUserId).then(result=>{
			let newUser = [];
			result.forEach(element =>{
				let image 	= element.profile_image ? mediaUlr+element.profile_image : mediaUlr+'user.png';
				let rating 	= element.user_rating ? element.user_rating : 0;
				let name 	= element.name ? (element.name + " "+ element.last_name) : element.companyName;
				let totalRate = 0;
				let fees = 0;
				let taxFees = 0;
				let feesAmount = 0;
				if(element.hourrate){
					fees = Number((element.hourrate * 15 ) / 100);
					feesAmount = Number(Number(element.hourrate) + Number(fees));
					if(element.taxPay){
						taxFees = Number((feesAmount * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
					else {
						taxFees = Number((fees * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
				}
				newUser.push({
					id		: element.id,
					service	: element.service,
					otherServiceName : element.serviceName=='Kita' ? element.otherServiceName : element.serviceName,
					name 	: name,
					type 	: element.type,
					image 	: image,
					rating 	: rating,
					perHour : totalRate,
					lat		: element.latitude,
					long 	: element.longitude,
					isJob   : false
				});

	    	});
	    	return newUser
		});
	let jobList = await Home.getSearchjob(city,serviceName,otherServiceName,specialty,otherSpecialty,10,jobPageOffset,curruntUserId).then(result=>{
			let data = [];
			result.forEach(element=>{
				let name 	= element.name ? element.name : element.companyName;
				let totalRate = 0;
				let fees = 0;
				let taxFees = 0;
				let feesAmount = 0;
				if(element.hourrate){
					fees = Number((element.hourrate * 15 ) / 100);
					feesAmount = Number(Number(element.hourrate) + Number(fees));
					if(element.taxPay){
						taxFees = Number((feesAmount * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
					else {
						taxFees = Number((fees * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
				}
				if(element.name && element.name!="undefined"){
					let image = mediaUlr + 'default-job-image.svg';
					if(element.documentImage != ""){
						let documentImage = JSON.parse(element.documentImage);
						if(documentImage.length > 0){
							image = mediaUlr + documentImage[0];
						}
					}
					data.push({
						id		: element.id,
						service : "",
						otherServiceName:element.serviceName=='Kita' ? element.otherServiceName : element.serviceName,
						name 	: element.name,
						type    : "",
						image 	: image,
						rating  : 0,
						perHour : totalRate,
						lat		: element.latitude,
						long 	: element.longitude,
						isJob   : true
					});
				}
			});
			return data;
		});
	res.status(200).send({success:true,message:'Vartotojo duomenys buvo grąžinti',data:{jobList: jobList, newUser: newUserData, totalNewUserPage:totalNewUserPage,totalJobPage:totalJobPage}});
	}
	catch(error){
		res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});
	}
}

homeController.filter = async function(req,res){
	try{
	let mediaUlr = req.protocol+"://"+req.headers.host+'/media/';
	let price 	= 0;
	let distance= 0;
	let curruntUserId 	  = 0;
	let latitude = 0;
	let longitude = 0;
	if (req.body.user_id) {
		let result = await Users.getUserById(req.body.user_id);
		if (result.length) {
			if (result[0].userType == 1) {
				curruntUserId = req.body.user_id;
			}
		}
		else{
			curruntUserId = req.body.user_id;
		}
	}
	if(req.body.price){
		price = req.body.price;
	}
	if(req.body.distance){
		distance = req.body.distance;
	}
	if(req.body.longitude){
		longitude = req.body.longitude;
	}
	if(req.body.latitude){
		latitude = req.body.latitude;
	}
	curruntUserId = req.body.user_id;
	/* Count User */	
	let userCount 	= await Home.getFilterUsersCount(price,distance,curruntUserId,latitude,longitude);
	let totalNewUserPage = Math.ceil(userCount[0].userCount/10);

	/* Count Job */
	let jobCount 	= await Home.getFilterJobCount(price,distance,curruntUserId,latitude,longitude);
	let totalJobPage = Math.ceil(jobCount[0].jobCount/10);

	let newUserPageOffset = 0;
	let jobPageOffset = 0;
	if(req.body.newUserPage && req.body.newUserPage > 0){
		newUserPageOffset = (req.body.newUserPage-1)*10;
	}
	if(req.body.jobPage && req.body.jobPage > 0){
		jobPageOffset = (req.body.jobPage-1)*10;
	}
	let newUserData = await Home.getFilterNewUsers(price,distance,10,newUserPageOffset,curruntUserId,latitude,longitude).then(result=>{
			let newUser = [];			
			result.forEach(element =>{
				let image 	= element.profile_image ? mediaUlr+element.profile_image : mediaUlr+'user.png';
				let rating 	= element.user_rating ? element.user_rating : 0;
				let name 	= element.name ? (element.name + " "+ element.last_name) : element.companyName;
				let totalRate = 0;
				let fees = 0;
				let taxFees = 0;
				let feesAmount = 0;
				if(element.hourrate){
					fees = Number((element.hourrate * 15 ) / 100);
					feesAmount = Number(Number(element.hourrate) + Number(fees));
					if(element.taxPay){
						taxFees = Number((feesAmount * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
					else {
						taxFees = Number((fees * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
				}
				newUser.push({
					id		: element.id,
					service	: element.service,
					otherServiceName : element.serviceName=='Kita' ? element.otherServiceName : element.serviceName,
					name 	: name,
					type 	: element.type,
					image 	: image,
					rating 	: rating,
					perHour : totalRate,
					lat		: element.latitude,
					long 	: element.longitude,
					isJob   : false
				});
	    	});
	    	return newUser
		});
	let jobList = await Home.getFilterJob(price,distance,10,jobPageOffset,curruntUserId,latitude,longitude).then(result=>{
			let data = [];
			result.forEach(element=>{
				let name 	= element.name ? element.name : element.companyName;
				let totalRate = 0;
				let fees = 0;
				let taxFees = 0;
				let feesAmount = 0;
				if(element.hourrate){
					fees = Number((element.hourrate * 15 ) / 100);
					feesAmount = Number(Number(element.hourrate) + Number(fees));
					if(element.taxPay){
						taxFees = Number((feesAmount * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
					else {
						taxFees = Number((fees * 21 ) / 100);
						totalRate = Number(Number(element.hourrate) + Number(fees) + Number(taxFees)).toFixed(2); 
					}
				}
				if(element.name && element.name!="undefined"){
					let image = mediaUlr + 'default-job-image.svg';
					if(element.documentImage != ""){
						let documentImage = JSON.parse(element.documentImage);
						if(documentImage.length > 0){
							image = mediaUlr + documentImage[0];
						}
					}
					data.push({
						id		: element.id,
						service : "",
						otherServiceName:element.serviceName=='Kita' ? element.otherServiceName : element.serviceName,
						name 	: element.name,
						type    : "",
						image 	: image,
						rating  : 0,
						perHour : totalRate,
						lat		: element.latitude,
						long 	: element.longitude,
						isJob   : true
					});
				}
			});
			return data;
		});
	res.status(200).send({success:true,message:'Vartotojo duomenys buvo grąžinti',data:{jobList: jobList, newUser: newUserData, totalNewUserPage:totalNewUserPage,totalJobPage:totalJobPage}});
	}
	catch(error){
		res.status(200).send({success:false,message:"Klaida, bandykite dar kartą."});
	}
}
module.exports = homeController;