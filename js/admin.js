async function addShooter(){

const shooter = {

name:
document.getElementById(
"shooter-name"
).value,


asa_number:
document.getElementById(
"asa-number"
).value,


class_name:
document.getElementById(
"class-name"
).value

};


const response =
await fetch(
"/api/admin/shooters",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:
JSON.stringify(shooter)

});


const result =
await response.json();


alert(
result.message ||
"Shooter Added"
);


}



async function saveScore(){


const score = {

shooter_id:1,

event_id:
Number(
document.getElementById(
"event"
).value
),


score:
Number(
document.getElementById(
"score"
).value
),


twelves:
Number(
document.getElementById(
"twelves"
).value
)

};


const response =
await fetch(
"/api/admin/scores",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:
JSON.stringify(score)

});


const result =
await response.json();


alert(
result.message ||
"Score Saved"
);


}
