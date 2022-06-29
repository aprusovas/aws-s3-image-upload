import * as FS from "fs"
import * as HTTP from "http"
import Sharp from "sharp"
import AWSS3Uploader from "./aws_s3_uploader"
import Config from "./config"
import { ResponseCodes } from "./enums/response_codes"
import * as Crypto from "crypto"
import { Uploader } from "./interfaces/uploader"

/**
 * Bootstrap
 */
const bootstrap = async () => {
    console.log(require('./../package.json').description)

    const config = new Config(process.env)
    const aws_s3_uploader = new AWSS3Uploader(config.aws_access_key_id, config.aws_access_key, config.aws_bucket)
    
    config.print_information()

    /**
     * Ends response with code and message
     * @param {HTTP.ServerResponse} res Response 
     * @param {ResponseCodes} code Response code 
     * @param {string} message Message
     */
    const end_with_code = (res: HTTP.ServerResponse, code: ResponseCodes, message?: string): void => {
        res.writeHead(code, message)
        res.end()
    }

    /**
     * Removes temporary file
     * @param {string} file_name File name
     */
    const remove_file = (file_name: string): void => {
        FS.unlink(file_name, (err) => {
            if (err) {
                console.error(err)
            }
        })
    }

    /**
     * Resizes image and uploads 
     * @param {Uploader} uploader Uploader
     * @param {number} resolution Maximum width and height of image to resize to
     * @param {string} tmp_file_name Temporary file name
     * @param {string} file_name New file name
     * @returns {Promise<void>} Promise
     */
    const resize_and_upload = async (uploader: Uploader, resolution: number, tmp_file_name: string, file_name: string): Promise<void> => {
        const extension = tmp_file_name.split('.').pop()
        const read_stream = FS.createReadStream(tmp_file_name)
        const transformer = Sharp().resize({ width: resolution, height: resolution }).toFormat(extension as any)
        const new_file_name = `${file_name}_${resolution}x${resolution}.${extension}`
        const location = await uploader.upload(new_file_name, read_stream.pipe(transformer))

        console.log(`Uploaded: ${location}`)
    }

    const server = HTTP.createServer((req: HTTP.IncomingMessage, res: HTTP.ServerResponse) => {
        res.setHeader('Accept', config.accept_header)

        const content_type = req.headers["content-type"]
        if (!content_type || !config.is_content_type_allowed(content_type)) {
            end_with_code(res, ResponseCodes.BadRequest, 'Content type not allowed')
            return
        }

        const content_length = req.headers['content-length']
        if (content_length && parseInt(content_length) > config.maximum_upload_size) {
            end_with_code(res, ResponseCodes.BadRequest, 'Resource size exceeds limit')
            return
        }

        const file_extension = content_type.split('/').pop()
        if (!file_extension) {
            end_with_code(res, ResponseCodes.BadRequest, 'File extension not found')
            return
        }

        const file_name = `${Crypto.randomBytes(8).toString("hex")}.${file_extension}`
        const write_stream = FS.createWriteStream(file_name, 'utf-8')

        write_stream.on('error', console.error)

        let size = 0

        req.on('data', (chunk) => {
            size += chunk.length

            if (size > config.maximum_upload_size) {
                write_stream.end()

                end_with_code(res, ResponseCodes.InternalError, 'Resource size exceeds limit')
                remove_file(file_name)
            }

            write_stream.write(chunk)
        })

        req.on("end", () => {
            write_stream.end()

            Promise.all(
                config.resize_resolutions.map(resolution =>
                    resize_and_upload(aws_s3_uploader, resolution, req.url ?? '', file_name)
                )
            ).then(() => {
                end_with_code(res, ResponseCodes.Success)
            }).catch((err) => {
                console.error(err)
                end_with_code(res, ResponseCodes.InternalError)
            }).finally(() => {
                remove_file(file_name)
            })
        })

    })

    server.listen(config.server_port)
    server.on('listening', () => {
        console.log(`Listening: http://localhost${config.server_port !== 80 ? `:${config.server_port}` : ''}`)
    })
}

bootstrap()