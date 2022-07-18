// create basic express app
const express = require('express');
const app = express();
const { cloudinary } = require('./utils/cloudinary');

app.use(express.json({ limit: '50mb' }));//allows us to pass json body data
// app.use(express.urlencoded({ limit: '50mb', extended: true}))//allows backed to accept form data

(
    app.post('/api/upload', async (req, res) => {
        let uploaded_url = 'res';
        try {
            const fileStr = req.body.data;
            const uploadResponse = await cloudinary.uploader.upload(fileStr, {
                resource_type: "video",
                chunksize: 6000,
            });
            uploaded_url = uploadResponse.secure_url
        } catch (error) {
            console.error(error)
            res.status(500).json({ err: 'Something went wrong' })
        }
        console.log(uploaded_url)
        res.json({ data: uploaded_url });
    })
)

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})