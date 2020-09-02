const Chat             	= require('../model/chat');
var chatController   	= {};

chatController.getUsers = function(req,res){
	/*var mediaUlr 			= req.protocol+"://"+req.headers.host+'/media/';
	Chat.getUsers(req.id).then(result => {
		if (result) {
			var Users = [];
			result.forEach(user =>{
				Users.push({
					id			: user.id,
					name		: user.name ? user.name : '',
					profileImage: user.profile_image ? mediaUlr+user.profile_image : mediaUlr+'user.png',
					status		: user.user_active
				});
			});
			return res.status(200).send({success:true,message:"vartotojas sėkmingai grįžta atgal",data:Users});
		}
		else{
			return res.status(500).send({success:false,message:"kažkas nutiko"});

		}
	});*/
	let userList = [];
	var mediaURL = req.protocol+"://"+req.headers.host+'/media/';
	Chat.getUsers(req.id).then(result => {
		if (result) {
			result.forEach(user =>{
				if(user.id !== req.id){
				userList.push({
					id			: user.id,
					name		: user.name ? user.name : '',
					profileImage: user.profile_image ? mediaURL + user.profile_image : mediaURL + 'user.png',
					status		: user.user_active
				});}
			});
			Chat.getNearestUserList(req.id).then(result =>{
				if(result){
					result.forEach(user =>{
						if((!userList.find(element => element.id==user.id)) && user.id !== req.id){
							userList.push({
								id			: user.id,
								name		: user.name ? user.name : '',
								profileImage: user.profile_image ? mediaURL + user.profile_image : mediaURL + 'user.png',
								status		: user.user_active
							});
						}
					});

					return res.status(200).send({success:true,message:"Vartotojas sėkmingai grįžta atgal",data:userList});
				}
				else{
					return res.status(500).send({success:false,message:"Kažkas nutiko"});
				}	
			});
		}
	});
}
chatController.getUserChat = function(req,res){
	var mediaUlr 			= req.protocol+"://"+req.headers.host+'/media/';
	if(!req.body.user_id){
		return res.status(200).send({success:false,message:"Reikalingas vartotojo ID"})
	}
	Chat.getUserChat(req.id,req.body.user_id).then(result => {
		if (result) {
			return res.status(200).send({success:true,message:"Vartotojo pokalbis sėkmingai grįžta",data:result});
		}
		else{
			return res.status(500).send({success:false,message:"Kažkas nutiko"});

		}
	});
}
module.exports = chatController;