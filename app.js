const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATA_DIR = `${__dirname}/4-natours/starter/dev-data/data/`;
const TOURS_PATH = DATA_DIR + 'tours.json';

const tours = JSON.parse(fs.readFileSync(TOURS_PATH));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        results: tours.length,
        data:{
            tours 
        } 
    }) 
})

app.get('/api/v1/tours/:id', (req, res) => {
    const {id} = req.params;
    const tour = tours.find(item => item._id === id);
    if(!tour) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    res.status(200).json({ 
        status: 'success', 
        data:{
            tour
        } 
    }) 
})


app.post('/api/v1/tours', (req, res) => {
    const newId = tours[tours.length -1]._id + 1;
    const newTour = {_id: newId, ...req.body};
    tours.push(newTour);
    fs.writeFile(TOURS_PATH, JSON.stringify(tours, null, ' '), err => {
        if(err) {
            res.send(500).json({
                status: 'error',
                message: err.message
            })
        } else {
            res.status(201).json({
                status: 'success',
                data:{ tour: newTour}
            })
        }
    })

})

// app.get('/', (req, res) => {
//     res.status(200).json({test:'test1', hello:'hello1'});
// })
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
})