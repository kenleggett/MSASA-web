let standings = [];


async function loadStandings(){


try {


const response =
await fetch("/api/soty");


const data =
await response.json();



if(!data.ok){

throw new Error(
"API returned error"
);

}



standings =
data.standings;



populateClasses();


renderStandings();



}

catch(error){


console.error(error);


document.getElementById(
"standings-body"
).innerHTML =

`
<tr>
<td colspan="5">
Unable to load standings
</td>
</tr>
`;

}


}





function populateClasses(){


const select =
document.getElementById(
"class-filter"
);


const classes =
[
...new Set(
standings.map(
x=>x.class_name
)
)
];


classes.forEach(c=>{


const option =
document.createElement(
"option"
);


option.value=c;

option.textContent=c;


select.appendChild(option);


});


}




function renderStandings(){


const search =
document.getElementById(
"shooter-search"
).value
.toLowerCase();



const selectedClass =
document.getElementById(
"class-filter"
).value;



let filtered =
standings.filter(
shooter=>{


return (

shooter.name
.toLowerCase()
.includes(search)

&&

(
selectedClass==="all"
||
shooter.class_name===selectedClass
)

);


});





const body =
document.getElementById(
"standings-body"
);



body.innerHTML="";



filtered.forEach(
(shooter,index)=>{


const row =
document.createElement(
"div"
);



row.className =
"standing-row";



row.innerHTML =

`

<span>
${shooter.rank ?? "-"}
</span>


<span>
${shooter.name}
</span>


<span>
${shooter.class_name}
</span>


<span>
${shooter.total_score}
</span>


<span>
${shooter.total_twelves}
</span>


`;



body.appendChild(row);


});


}







document
.getElementById(
"shooter-search"
)
.addEventListener(
"input",
renderStandings
);



document
.getElementById(
"class-filter"
)
.addEventListener(
"change",
renderStandings
);



document.addEventListener(
"DOMContentLoaded",
loadStandings
);
