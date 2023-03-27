const {SELECT, INSERT, UPDATE, DELETE, CLIENT} =require("./main");

describe('Simple CRUD', () => {
    test('select data', async () => {
        var result;
        try{
            result = await CLIENT.run(SELECT('_id', 'name', 'age')
                                        .from('student')
                                        .where('age', '>', 10)
                                        .orderBy('name')
                                    );
            //console.log(result);
        } catch(error){
            console.log(error);
            result = {error};
        }
        expect(result.data.rows.length).toBe(3);
    });
    test('insert data', async () => {
        var result;
        try{
            result = await CLIENT.run(INSERT({_id: '11', name: 'abc', age: 19})
                                        .into('student')
                                    );
            //console.log(result);
        } catch(error){
            console.log(error);
            result = {error};
        }
        expect(result.data.changes).toBe(1);
    });
    test('update data', async () => {
        var result;
        try{
            result = await CLIENT.run(UPDATE('11')
                                        .into('student')
                                        .set({name: 'xyz', age: 20})
                                    );
            //console.log(result);
        } catch(error){
            console.log(error);
            result = {error};
        }
        expect(result.data.changes).toBe(1);
    });

    test('select data', async () => {
        var result;
        try{
            result = await CLIENT.run(SELECT('_id', 'name', 'age')
                                        .from('student')
                                        .where('age', '>', 10)
                                        .orderBy('name')
                                    );
            //console.log(result);
        } catch(error){
            console.log(error);
            result = {error};
        }
        expect(result.data.rows.length).toBe(4);
    });

    test('delete data', async () => {
        var result;
        console.log(DELETE('11').from('student'));
        try{
            result = await CLIENT.run(
                                            DELETE('11').from('student')
                                        );
            //console.log(result);
        } catch(error){
            console.log(error);
            result = {error};
        }
        expect(result.data.changes).toBe(1);
    });
    
})
