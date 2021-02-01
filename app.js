const express = require('express')
const app = express()
const mongo = require('mongodb')
const mongoClient = mongo.MongoClient;
const mongoUrl = 'mongodb+srv://dblalchand:lal123chand@cluster0.gys8x.mongodb.net/lalchanddb?retryWrites=true&w=majority';
let db;
const port = process.env.PORT || 3000;

const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (error, connection) => {
    if (error) throw error;
    db = connection.db('lalchanddb');
})

app.listen(port, (error) => {
    if (error) throw error;
})

app.get('/', (req, res) => {

    if (req.query.pages) {
        if (Number(req.query.pages) > 0) {

            db.collection('studentsBoard').find().count((error, resultCount) => {
                if (error) throw error;
                if (Number(req.query.pages) <= resultCount) {
                    db.collection('studentsBoard').find().limit(Number(req.query.pages)).toArray((error, result) => {
                        if (error) throw error;
                        res.send(result)
                    })
                } else {
                    res.send(`you have only ${resultCount} pages`)
                }
            })
        } else {
            res.send(`please give only positive number`);
        }

    } else {
        db.collection('studentsBoard').find().toArray((error, result) => {
            if (error) throw error;
            res.send(result)
        })
    }


})

app.get('/:name', (req, res) => {
    if (req.params.name == "sort") {
        db.collection('studentsBoard').find().sort({ name: 1 }).toArray((error, result) => {
            if (error) throw error;
            res.send(result)
        })
    } else {
        db.collection('studentsBoard').find({ name: req.params.name }).toArray((error, result) => {
            if (error) throw error;

            if (result.length === 0) {
                res.send("user not found error 404");
            } else {
                res.send(result);
            }

        })
    }

})


app.get('/:name/:directory', (req, res) => {

    db.collection('studentsBoard').find({ name: req.params.name }).toArray((error, result) => {
        if (error) throw error;
        const filter = result.map((data) => {

            switch (req.params.directory) {
                case "tasks":
                    return data.tasks;
                    break;
                case "assignments":
                    return data.assignments;
                    break;
                default:
                    return `page not found error 404 ${req.params.directory} is not a params`;
                    break;
            }


        })
        res.send(filter)
    })

})



app.post('/newUser', (req, res) => {
    db.collection('studentsBoard').insertOne(req.body, (error, result) => {
        if (error) throw error;
        res.status(200).send("data added successfully");
    })
})




app.put('/updateUser', (req, res) => {
    db.collection('studentsBoard').updateOne({ _id: req.body.id }, { $set: { name: req.body.name, mail: req.body.mail } }, (error, result) => {
        if (error) throw error
        res.status(200).send("data successfully updated")
    })
})



app.delete('/', (req, res) => {
    if (req.query.delete) {
        db.collection('studentsBoard').remove({ name: req.query.delete }, (error, result) => {
            if (error) throw error
            res.status(200).send("data successfully deleted")
        })
    }
})