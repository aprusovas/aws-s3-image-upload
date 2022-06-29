import * as AWS from "aws-sdk"
import { Readable } from "stream"
import { Uploader } from "./interfaces/uploader"
import { callbackToPromise } from "./utils/functions"

/**
 * AWS S3 Uploader
 */
export default class AWSS3Uploader implements Uploader {

    private readonly s3: AWS.S3

    /**
     * Constructs essential class data
     * @param {string} accessKeyId The AWS access key ID
     * @param {string} secretAccessKey The AWS secret access key
     * @param {string} bucket The AWS S3 Bucket to upload resources to
     */
    constructor(accessKeyId: string, secretAccessKey: string, private readonly bucket: string) {
        this.s3 = new AWS.S3({ credentials: new AWS.Credentials(accessKeyId, secretAccessKey) })
    }

    /**
     * Method should upload readable with passed file path
     * @param {string} file_path Current uploader file path to upload file to
     * @param {Readable} readable File
     * @returns {Promise<string>} Resource final location
     */
    async upload(file_path: string, readable: Readable): Promise<string> {
        if (!file_path) {
            throw new Error(`Invalid file path`)
        }
        if (!readable) {
            throw new Error(`Invalid readable`)
        }

        const result = await callbackToPromise<AWS.S3.ManagedUpload.SendData>(cb => this.s3.upload({
            Bucket: this.bucket,
            Key: file_path,
            Body: readable
        }, cb))

        if (!result || !result.Location) {
            throw new Error(`Invalid AWS S3 response`)
        }
        
        return result.Location
    }
}