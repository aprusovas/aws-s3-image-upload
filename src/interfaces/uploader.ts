import { Readable } from "stream"

/**
 * Uploader interface
 */
export interface Uploader {
    /**
     * Method should upload readable with passed file path
     * @param {string} file_path Current uploader file path to upload file to
     * @param {Readable} readable File
     * @returns {Promise<string>} Resource final location
     */
    upload(file_path: string, readable: Readable): Promise<string>
}