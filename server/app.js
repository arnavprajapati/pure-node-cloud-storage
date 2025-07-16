import { createWriteStream } from 'fs'
import { open, readdir, readFile, rename, rm, stat } from 'fs/promises'
import http from 'http'
import mime from 'mime-types'
import path from 'path'

const PORT = 80
const Hostname = '0.0.0.0'

const server = http.createServer(async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Filename");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Filename, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*")

    const data = decodeURIComponent(req.url).split('?')
    const [url, queryString] = data
    // console.log({url, queryString});

    const queryParam = {}

    queryString?.split('?').forEach((elem) => {
        const [key, value] = elem.split('=')
        queryParam[key] = value
    })


    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // console.log(queryParam);

    if (req.method === 'GET') {
        if (req.url === '/favicon.ico') return res.end("No Favicon");

        if (req.url === '/') {
            serverDirectory(url, res);
        } else {
            try {
                const filePath = `./storage${decodeURIComponent(url)}`;
                const fileHandle = await open(filePath);
                const fileStats = await fileHandle.stat();

                if (fileStats.isDirectory()) {
                    await fileHandle.close();
                    return serverDirectory(url, res);
                }

                const contentType = mime.contentType(url.slice(1))
                const range = req.headers.range;
                let start = 0;
                let end = fileStats.size - 1;

                if (range) {
                    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
                    start = parseInt(startStr, 10);
                    if (endStr) end = parseInt(endStr, 10);

                    res.writeHead(206, {
                        'Content-Range': `bytes ${start}-${end}/${fileStats.size}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': end - start + 1,
                        'Content-Type': contentType
                    });
                } else {
                    res.writeHead(200, {
                        'Content-Length': fileStats.size,
                        'Content-Type': contentType,
                        'Accept-Ranges': 'bytes'
                    });
                }

                if (queryParam.action === 'download') {
                    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(url)}"`);
                } else if (queryParam.action === 'open') {
                    res.setHeader('Content-Disposition', 'inline');
                }

                const readStream = fileHandle.createReadStream({ start, end });

                readStream.pipe(res);

                readStream.on('end', async () => {
                    await fileHandle.close(); // ✅ prevent warning
                });

                readStream.on('error', async (err) => {
                    console.error("Stream error:", err);
                    await fileHandle.close(); // ✅ close on error too
                    res.statusCode = 500;
                    res.end("Stream error");
                });

            } catch (err) {
                console.log("GET error:", err.message);
                res.statusCode = 500;
                res.end("Server error");
            }
        }
    }


    else if (req.method === 'POST') {
        const writeStream = createWriteStream(`./storage/${req.headers.filename}`);
        req.pipe(writeStream);

        writeStream.on("finish", () => {
            res.end("File uploaded successfully");
        });

        writeStream.on("error", (err) => {
            console.error(err);
            res.statusCode = 500;
            res.end("Upload failed");
        });

        req.on("end", () => {
            console.log("Upload completed and connection closed");
        });

        req.on("close", () => {
            console.log("Request stream closed by client");
        });
        // const writeStream = createWriteStream(`./storage/${req.headers.filename}`);
        // let count = 0;
        // req.on("data", (chunk) => {
        //   count++;
        //   writeStream.write(chunk);
        // });
        // req.on("end", () => {
        //   console.log("Chunks received:", count);
        //   res.end("File uploaded successfully");
        // });
    }

    else if (req.method === 'DELETE') {
        req.on('data', async (chunk) => {
            const fileName = chunk.toString()
            console.log(fileName);
            try {
                await rm(`./storage/${fileName}`)
                res.end('file deleted successfuly')
            } catch (err) {
                console.log(err.message);
            }
        })
    }

    else if (req.method === 'PATCH') {
        req.on('data', async (chunk) => {
            const data = JSON.parse(chunk.toString())

            const oldPath = `./storage/${data.oldFileName}`;
            const newPath = `./storage/${data.newFileName}`;

            await rename(oldPath, newPath);

            console.log(data);
            res.end("rename successfully")
        })
    }

})

async function serverDirectory(url, res) {
    const fileList = await readdir(`./storage${url}`);

    const fileInfoList = [];

    for (const file of fileList) {
        const fileStats = await stat(`./storage${url}/${file}`);
        fileInfoList.push({
            name: file,
            size: fileStats.size,
            type: path.extname(file).slice(1).toUpperCase() || 'UNKNOWN'
        });
    }
    console.log(fileInfoList);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(fileInfoList)); // [{ name, size, type }]
}

server.listen(PORT, Hostname, () => {
    console.log(`server started at port ${PORT}`);
})