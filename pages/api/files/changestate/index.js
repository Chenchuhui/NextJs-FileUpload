import dbConnect from "../../../../lib/dbConnect";
import File from "../../../../models/File";

export default async function (req, res) {
    const fileArr = req.body.files;
    console.log(fileArr);

    // This is not a valid array
    if (!Array.isArray(fileArr)) {
        return res.status(400).send({ message: "Invalid file array" });
    }
    await dbConnect();

    if (fileArr.length > 0) {
        try {
            const result = await File.updateMany(
                {
                    _id: {$in: fileArr}
                },
                {
                    $set: { uploaded: true}
                }
            );
            console.log(result)
            if (result) {
                return res.status(200).json({success: true, message: 'Files Updated Successfully'})
            } else {
                return res.status(404).json({success: false, message: 'Failed to Update Files'})
            }
        } catch (err) {
            console.log(err)
            return res.status(500).json({success: false, message: err});
        }
    } else {
        return res.status(200).json({success: true, message: 'No Files Need To Be Updated. Pass!'})
    }


}