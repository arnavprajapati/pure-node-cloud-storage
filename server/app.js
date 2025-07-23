import http from "http";
import mime from "mime-types";
import supabase from "./supabase.js";

const PORT = process.env.PORT || 4000;
const Hostname = "0.0.0.0";

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");

    const data = decodeURIComponent(req.url).split("?");
    const [url, queryString] = data;

    const queryParam = {};
    queryString?.split("&").forEach((elem) => {
        const [key, value] = elem.split("=");
        queryParam[key] = value;
    });

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === "GET") {
        const { data, error } = await supabase.storage.from("uploads").list("", {
            limit: 100,
            offset: 0,
            sortBy: { column: "name", order: "asc" },
        });

        if (error) {
            res.statusCode = 500;
            return res.end("Failed to read files");
        }

        const fileList = data.map((file) => ({
            name: file.name,
            size: file.metadata?.size || 0,
            type: mime.lookup(file.name) || "UNKNOWN",
        }));

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(fileList));
    }else if (req.method === "POST") {
        const filename = req.headers.filename;
        const chunks = [];

        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", async () => {
            const fileBuffer = Buffer.concat(chunks);
            const { error } = await supabase.storage
                .from("uploads")
                .upload(filename, fileBuffer, {
                    contentType: mime.lookup(filename) || "application/octet-stream",
                    upsert: true,
                });

            if (error) {
                res.statusCode = 500;
                return res.end("Upload failed");
            }

            res.end("Upload successful");
        });
    }else if (req.method === "DELETE") {
        req.on("data", async (chunk) => {
            const fileName = chunk.toString();
            const { error } = await supabase.storage.from("uploads").remove([fileName]);

            if (error) {
                res.statusCode = 500;
                return res.end("Delete failed");
            }

            res.end("File deleted successfully");
        });
    }else if (req.method === "PATCH") {
        req.on("data", async (chunk) => {
            const { oldFileName, newFileName } = JSON.parse(chunk.toString());
            const { error } = await supabase.storage
                .from("uploads")
                .move(oldFileName, newFileName);

            if (error) {
                res.statusCode = 500;
                return res.end("Rename failed");
            }

            res.end("Rename successful");
        });
    }
});

server.listen(PORT, Hostname, () => {
    console.log(`✅ Server started on port ${PORT}`);
});
