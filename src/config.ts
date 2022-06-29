import { bytesToSize } from "./utils/functions"

/**
 * All service configuration information
 */
export default class Config {

    private _server_port: number
    private _maximum_upload_size: number
    private _allowed_content_types: Map<string, boolean>
    private _accept_header: string
    private _aws_access_key_id: string
    private _aws_access_key: string
    private _aws_bucket: string

    /**
     * Constructs configuration information from NodeJS process environment
     * @param {NodeJS.ProcessEnv} env NodeJS process environment
     */
    constructor(env: NodeJS.ProcessEnv) {
        if (!env.AWS_ACCESS_KEY_ID) {
            throw new Error(`Environment variable AWS_ACCESS_KEY_ID is required`)
        }
        
        if (!env.AWS_ACCESS_KEY) {
            throw new Error(`Environment variable AWS_ACCESS_KEY is required`)
        }
        
        if (!env.AWS_BUCKET) {
            throw new Error(`Environment variable AWS_BUCKET is required`)
        }
        
        this._aws_access_key_id = env.AWS_ACCESS_KEY_ID
        this._aws_access_key = env.AWS_ACCESS_KEY
        this._aws_bucket = env.AWS_BUCKET
        this._server_port = env.SERVER_PORT ? parseInt(env.SERVER_PORT) : 80
        this._maximum_upload_size = env.MAXIMUM_UPLOAD_SIZE ? parseInt(env.MAXIMUM_UPLOAD_SIZE) : 10_000_000
        this._allowed_content_types = new Map(
            (env.ALLOWED_CONTENT_TYPES ?? 'image/jpeg,image/png').split(',').map(v => {
                return [v.toLowerCase().trim(), true]
            })
        )
        this._accept_header = Array.from(this._allowed_content_types.keys()).join(', ')
        
        if (this._accept_header.length <= 0) {
            throw new Error(`Environment variable ALLOWED_CONTENT_TYPES must include at least one content type`)
        }
        
        if (!Number.isInteger(this._server_port) || this._server_port < 0 || this._server_port > 65535) {
            throw new Error(`Environment variable SERVER_PORT is invalid, must be in the range 0 to 65535 (inclusive)`)
        }
        
        if (!Number.isInteger(this._maximum_upload_size) || this._maximum_upload_size <= 0) {
            throw new Error(`Environment variable MAXIMUM_UPLOAD_SIZE is invalid, must be > 0`)
        }
    }

    /**
     * Returns server port
     */
    get server_port(): number {
        return this._server_port
    }

    /**
     * Returns maximum allowed upload size in bytes
     */
    get maximum_upload_size(): number {
        return this._maximum_upload_size
    }

    /**
     * Returns accept header
     */
    get accept_header(): string {
        return this._accept_header
    }

    /**
     * Returns The AWS access key ID
     */
    get aws_access_key_id(): string {
        return this._aws_access_key_id
    }

    /**
     * Returns The AWS secret access key
     */
    get aws_access_key(): string {
        return this._aws_access_key
    }

    /**
     * Returns The AWS S3 Bucket name
     */
    get aws_bucket(): string {
        return this._aws_bucket
    }

    /**
     * Returns resolutions array to resize uploaded images to
     */
    get resize_resolutions(): readonly number[] {
        return [
            2048,
            1024,
            300
        ]
    }

    /**
     * Returns true when content type is allowed to upload
     * @param {string} type Content type
     * @returns {boolean} True when content type is allowed to upload
     */
    is_content_type_allowed(type?: string): boolean {
        if (!type) {
            return false
        }
        return this._allowed_content_types.has(type.toLowerCase().trim())
    }

    /**
     * Prints current configuration information
     */
    print_information(): void {
        console.log('-'.repeat(50))
        console.log(`PORT: ${this._server_port}`)
        console.log(`ACCEPT: ${this._accept_header}`)
        console.log(`MAXIMUM_UPLOAD_SIZE: ${bytesToSize(this._maximum_upload_size)}`)
        console.log(`AWS_ACCESS_KEY_ID: ${this._aws_access_key_id}`)
        console.log(`AWS_ACCESS_KEY: ${this._aws_access_key}`)
        console.log(`AWS_BUCKET: ${this._aws_bucket}`)
        console.log(`RESOLUTIONS: ${this.resize_resolutions.join(', ')}`)
        console.log('-'.repeat(50))
    }
}