import { flatten } from 'array-flatten';

var slice = Array.prototype.slice;

function isServer() {
    return ! (typeof window != 'undefined' && window.document);
}

function validSet(set){
    if(typeof set !== "string"){
        return false;
    }
    return true;
}
function validWhere(left, opr, right){
    if(typeof left !== "string" || typeof opr !== "string"){
        return false;
    }
    if(right === undefined){
        return false;
    }
    return true;
}
function validField(field){
    if(typeof field !== "string"){
        return false;
    }
    return true;
}
function validOrder(field, order){
    if(typeof field !== "string"){
        return false;
    }
    return true;
}
function validLimit(rows){
    if(typeof rows !== "number" ){
        return false;
    }
    return true;
}
class QueryRunner{
    constructor(client = new Client()){
        this.client = client;
    }

    then(onResolved, onRejected) {
        return this.getPromise().then(onResolved, onRejected);
    }
    
    getPromise() {
        if (!this.innerPromise) {
            this.innerPromise = (async() => {
                if(this.client) {
                    let response;
                    let query = Object.assign({}, this);
                    delete query.then;
                    if(this.cb){
                        response = await this.client.subscribe(query);
                    } else {                    
                        response = await this.client.run(query);
                    }
                    return response;
                } else {
                    return undefined;
                }
            })();
        }
        return this.innerPromise;
    }
}
class FnRunner{
    constructor(client = new Client()){
        this.client = client;
    }

    async run(path, body, headers){
        //let path =  `adm/${fx}`  ;
        const result = await this.client.fx(path, body, headers);
        return result;
    }
}
class Query{
    constructor(){

    }
}
class Select extends Query{
    constructor() {
        super();
        this.select = {
            from: '',
            fields: [],
            where: [],
            orderBy: [],
        };
        var fields = flatten(slice.call(arguments, 0));
        fields.forEach((field) => {
            if (validField(field)) {
                this.select.fields.push(field);
            }
        });
    }
    // form sources
    from(coll) {
        if (validSet(coll)) {
            this.select.from = coll;
            this.coll = coll;
        }
        return this;
    };
    // where conditions
    where(left, opr, right) {
        if(typeof left === "object"){
            for (const key in left){
                if (validWhere(key, '=', left[key])) {
                    this.select.where.push({ left: key, opr: '=', right: left[key]});
                }
            }
        } else {
            if (validWhere(left, opr, right)) {
                this.select.where.push({ left, opr, right });
            }
        }
        return this;
    };

    orderBy(field, order){
        if(order === undefined){
            order = "asc";
        }
        if (validOrder(field)) {
            this.select.orderBy.push({ field, order });
        }
        return this;
    };

    limit(rows) {
        if (validLimit(rows)) {
            this.select.limit = rows;
        }
        return this;
    };

    offset(index) {
        if (validLimit(index)) {
            this.select.offset = index;
        }
        return this;
    };

    onChange(cb, sub){
        this.cb = cb;
        this.sub = sub;
        return this;
    }
}

class Insert  extends Query{
    constructor(entry) {
        super();
        this.insert = {};
        if (typeof entry === "object") {
            this.insert.entry = entry;
        }
    }
    into(coll) {
        if (validSet(coll)) {
            this.insert.into = coll;
            this.coll = coll;
        }
        return this;
    };
}

class Update extends Query {
    constructor(entryKey) {
        super();
        this.update = {};
        this.update.doc = entryKey;
    }
    into(coll){
        if (validSet(coll)) {
            this.update.into = coll;
            this.coll = coll;
        }
        return this;
    };

    set(data){
        if (typeof data === "object") {
            this.update.entry = data;
        }
        return this;
    };
}
class Delete  extends Query{
    constructor(entryKey) {
        super();
        this.delete = {};
        this.delete.doc = entryKey; 
    }
    from(coll){
        if (validSet(coll)) {
            this.delete.from = coll;
            this.coll = coll;
        }
        return this;
    };
}

class Client {
    endpoint = "http://localhost:3000/api/v1";
    constructor(endpoint){
        if(endpoint) this.endpoint = endpoint;
    }
    async fx(path, body, headers){
        let options = {};
        let url =  `${this.endpoint}/${path}`  ;
        if(headers) options.headers = {...headers};
        else options.headers = this.headers || {};
        options.method = "POST";
        if(body){
            options.body = JSON.stringify(body);
        }
        options.headers['Content-Type'] = 'application/json';
        let token;
        if(!isServer()){
            token = localStorage.getItem('token');
        }
        if(token){
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        try{
            const response = await fetch(url, options);
            const data = await response.json();
            return data;
        }catch(error){
            return error;
        }
    }
    async onEvent(path, params, cb){
        let paramStr ;
        if(params){
            let paramArr = [];
            Object.entries(params).forEach(([key, value]) => {
                let valueStr = "";
                if(typeof value === "object")
                    valueStr = JSON.stringify(value);
                else 
                    valueStr = value;
                paramArr.push(`${key}=${valueStr}`);
            });    
            paramStr = paramArr.map(param => param).join('&');
        }
        let url =  `${this.endpoint}/${path}`  ;
        if(paramStr){
            url = url + `?${paramStr}`;
        }else {
            throw new Error('Subscribe function only supports select query');
        }
        const events = new EventSource(url);
        events.onopen = (event) => {
            //console.log(event);
        };
        events.onerror = (event) => {
            //console.log(event);
        };
        events.onmessage = (event) => {
            //console.log(event);
            const parsedData = JSON.parse(event.data);
            cb(parsedData);
        };
        return events;
    }

    async run(query, headers){
        let path =  `que/${query.coll}`  ;
        const result = await this.fx(path, query, headers);
        return result;
    }

    async subscribe(query){
        let path =  `sub/${query.coll}`  ;
        let params = {
            sub: query.sub || {},
            dql: query
        };
        return await this.onEvent(path, params, query.cb);
    }
}
class Direcbase{
    constructor(runner, context){
        if(!runner) this.runner = new QueryRunner();
        else this.runner = runner;
        if(context) this.context = context;
    }

    useRunner(runner){
        this.runner = runner;
        //Query.prototype.then = this.runner.then;
        //Query.prototype.getPromise = this.runner.getPromise;
    }

    useEndpoint(endpoint, headers){
        if(endpoint) this.runner.client.endpoint = endpoint;
        if(headers) this.runner.client.headers = headers;
    }

    useClient(client){
        this.runner.client = client;
    }
}
class Direcstore extends Direcbase{

    constructor(runner = new QueryRunner(), context){
        super(runner, context);
    }

    assignRunner(query){
        Object.assign(query, this.runner);
        query.then = this.runner.then;
        query.getPromise = this.runner.getPromise;
        query.context = this.context || {};
        return query;
    }

    run(query){
        return this.assignRunner(query);
    }

    select(...args){
        return this.assignRunner(new Select(...args));
    }
    update(...args){
        return this.assignRunner(new Update(...args));
    }
    insert(...args){
        return this.assignRunner(new Insert(...args));
    }
    delete(...args){
        return this.assignRunner(new Delete(...args));
    }
}

class Direcauth extends Direcbase{

    constructor(runner) {
        let initRunner;
        if (!runner) initRunner = new FnRunner();else initRunner = runner;
        super(initRunner);
    }
    
    async login(body, headers){
        const {tokens} = await this.runner.run('auth/login', body, headers);
        if(tokens){
            if(!isServer()){
                localStorage.setItem("token", tokens.access.token);
                localStorage.setItem("tokenRefresh", tokens.refresh.token);
            }
            return tokens;
        } else {
            return undefined;
        }
    }

    async logout(headers){
        const result = await this.runner.run('auth/logout', {}, headers);
        if(!isServer() && result){
            localStorage.setItem("token", tokens.access.token);
            localStorage.setItem("tokenRefresh", tokens.refresh.token);
        }
        return result;
    }

    async validateToken(headers){
        return await this.runner.run('auth/validtoken', {}, headers);
    }

}
class Direcadmin extends Direcbase{

    constructor(runner, context) {
        let initRunner;
        if (!runner) initRunner = new FnRunner();else initRunner = runner;
        super(initRunner, context);
    }

    async createChange(body, headers){
        return await this.runner.run('adm/change', body, headers);
    }

    async deployChange(body, headers){
        return await this.runner.run('adm/change/deploy', body, headers);
    }

    async codegen(body, headers){
        return await this.runner.run('adm/schema/codegen', body, headers);
    }
    async editModel(body, headers){
        return await this.runner.run('adm/schema', body, headers);
    }
    async editRules(body, headers){
        return await this.runner.run('adm/schema/rule', body, headers);
    }
    async deleteModel(body, headers){
        return await this.runner.run('adm/schema/drop', body, headers);
    }
    async createUser(body, headers){
        return await this.runner.run('adm/auth/signup', body, headers);
    }
    async deleteUser(body, headers){
        return await this.runner.run('adm/auth/drop', body, headers);
    }
    async editUser(body, headers){
        return await this.runner.run('adm/auth/edit', body, headers);
    }
    async resetUserPwd(body, headers){
        return await this.runner.run('adm/auth/resetPwd', body, headers);
    }
    async getMetrics(body, headers){
        return await this.runner.run('adm/sys/metrics', body, headers);
    }
    async getEnv(body, headers){
        return await this.runner.run('adm/sys/getenv', body, headers);
    }
    async setEnv(body, headers){
        return await this.runner.run('adm/sys/setenv', body, headers);
    }
}
const SELECT = function(...args){
    return new Select(...args);
};
const INSERT = function(...args){
    return new Insert(...args);
};
const UPDATE = function(...args){
    return new Update(...args);
};
const DELETE = function(...args){
    return new Delete(...args);
};

class Direccall extends Direcbase{
    constructor(runner) {
        let initRunner;
        if (!runner) initRunner = new FnRunner();else initRunner = runner;
        super(initRunner);
    }

    async run(fxname, body, headers){
        return await this.runner.run(`fx/${fxname}`, body, headers);
    }
}
const direcstore = new Direcstore(); 
const direcadmin = new Direcadmin();
const direcauth = new Direcauth();
const direccall = new Direccall();

export { DELETE, Direcadmin, Direcauth, Direccall, Direcstore, FnRunner, INSERT, QueryRunner, SELECT, UPDATE, direcadmin, direcauth, direccall, direcstore };
