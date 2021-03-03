const hbs = require('handlebars');

module.exports = {
    json: function (context) {
        return new hbs.SafeString(JSON.stringify(context));
    },
    toLocalDatetime: function (context) {
        try{
            var date = new Date(context);
            return new hbs.SafeString(date.toLocaleString('en-GB'));
        } catch(e){
            console.log('ERROR - toLocalDatetime: ', e);
            return '';
        }
    }
}