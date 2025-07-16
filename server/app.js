import { open, readdir, readFile } from 'fs/promises'
import http from 'http'
import  mime from 'mime-types'

const PORT = 80
const Hostname = '0.0.0.0'

const server = http.createServer(async (req, res) => {
    if(req.url === '/favicon.ico') return "No Favicon"

    const data = decodeURIComponent(req.url).split('?')
    const [url, queryString] = data
    // console.log({url, queryString});

    const queryParam = {}

    queryString?.split('?').forEach((elem) => {
        const [key, value] = elem.split('=')
        queryParam[key] = value
    })

    // console.log(queryParam);

    if(req.url === '/'){
        serverDirectory(url, res)
    }else{
        try{
            const readFile = await open(`./storage${decodeURIComponent(url)}`)
            const fileStats = await readFile.stat()
            if(fileStats.isDirectory()){
                await readFile.close()
                await serverDirectory(url, res)
            }else{

                const readStream = readFile.createReadStream()
                const contentType = mime.contentType(url.slice(1))
                console.log(contentType);
                
                res.setHeader('Content-Type', 'contentType')
                res.setHeader('Content-Length', fileStats.size)

                if(queryParam.action === 'download'){
                    res.setHeader('Content-Disposition', `attachment; filename="${url.slice(1)}"`)
                }else if(queryParam.action === 'open'){
                    res.setHeader('Content-Disposition', "inline")
                }

                readStream.pipe(res)

                readStream.on('close', async () => {
                    await readFile.close()
                })
            }
        }catch (err) {
            console.log(err.message);
            res.end("Server not reached")
        }
    }
})

async function serverDirectory(url, res){
    const itemList = await readdir(`./storage${url}`)
        let dynamicHTML = ''
        itemList.forEach((elem) => {
            dynamicHTML += `
                <a>${elem}</a>
                <a href=".${url === "/" ? "" : url}/${elem}?action=open">Open</a>
                <a href=".${url === "/" ? "" : url}/${elem}?action=download">Download</a><br>
            `
        })
        const boilerHTML = await readFile('./index.html', 'utf-8')
        res.end(`
            ${boilerHTML.replace('${dynamicHTML}', dynamicHTML)}
        `)
}

server.listen(PORT, Hostname, () => {
    console.log(`server started at port ${PORT}`);
})