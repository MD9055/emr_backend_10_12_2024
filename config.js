const config = {
    local: {
        DB: {
            HOST: "127.0.0.1",
            PORT: "27017",
            DATABASE: "medtool",
            UserName: "",
            Password: "",
           
        },
        FRONTEND:{
            HOST:'localhost',
            PORT:4200
        },
       
        PORTS: {
            API_PORT: 4001,
        },
        EMAIL: {
            host: "smtp.gmail.com",
            user: "medtoolsystems@gmail.com",
            password: "jxflzmgarmxuhddm",
        },
        cryptoSecret: "Cadence@08$08#2022",
        JWTSECRET: {
            JWT: "medtool@2023",
            EXPIRYTIME:"72h"
        },
        ENCRYPTION: {
            algorithm: "aes-256-cbc",
            iv: "Cadence@08$08#2022"
        },
        CRYPTOJS:{
            SECRETKEY:"medtool@2024"
        },
      
    },

    staging: {
        DB:{
            HOST: "0.0.0.0",
            PORT: "27017",
            DATABASE: "test",
            MONGOOSE:{
                useUndifinedTopology: true,
                useNewUrlParser: true
            },
            UserName: "medtoolsystems",
            Password: "QFoyWLCUsdKlpIYr"
        },


       
        PORTS: {
            API_PORT: 4001,
        },
        EMAIL: {
            host: "smtp.gmail.com",
            user: "medtoolsystems@gmail.com",
            password: "jxflzmgarmxuhddm",
        },
        cryptoSecret: "Cadence@08$08#2022",
        JWTSECRET: {
            JWT: "medtool@2023",
            EXPIRYTIME:"72h"
        },
        ENCRYPTION: {
            algorithm: "aes-256-cbc",
            iv: "Cadence@08$08#2022"
        },
        CRYPTOJS:{
            SECRETKEY:"medtool@2024"
        },
       
    },
    production: {
        DB:{
            HOST: "0.0.0.0",
            PORT: "27017",
            DATABASE: "test",
            MONGOOSE:{
                useUndifinedTopology: true,
                useNewUrlParser: true
            },
            UserName: "medtoolsystems",
            Password: "QFoyWLCUsdKlpIYr"
        },

        FRONTEND:{
            HOST:'http://159.203.100.155',
            PORT:3000
        },
       


       
        PORTS: {
            API_PORT: 4001,
        },
        EMAIL: {
            host: "smtp.gmail.com",
            user: "medtoolsystems@gmail.com",
            password: "jxflzmgarmxuhddm",
        },
        cryptoSecret: "Cadence@08$08#2022",
        JWTSECRET: {
            JWT: "medtool@2023",
            EXPIRYTIME:"72h"
        },
        ENCRYPTION: {
            algorithm: "aes-256-cbc",
            iv: "Cadence@08$08#2022"
        },
        CRYPTOJS:{
            SECRETKEY:"medtool@2024"
        },
        
    }
}

module.exports.get = function get(env) {
    return config[env];
};