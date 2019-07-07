
function showDiff(date1, date2){

    let diff = (date2 - date1)/1000;
    diff = Math.abs(Math.floor(diff));

    const days = Math.floor(diff/(24*60*60));
    let leftSec = diff - days * 24*60*60;

    const hrs = Math.floor(leftSec/(60*60));
    leftSec = leftSec - hrs * 60*60;

    const min = Math.floor(leftSec/(60));
    leftSec = leftSec - min * 60;

    let output = "";
    if(days != 0){
        output += days + " days ";
    }
    if(hrs != 0){
        output += hrs + " hours ";
    }
    if(min != 0){
        output += min + " minutes ";
    }
    if( days != 0 || hrs != 0 || min != 0){
        output += "and ";
    }
    output += leftSec + " seconds ";
    
    return  output + "ago";

}

module.exports = {
    showDiff,
}