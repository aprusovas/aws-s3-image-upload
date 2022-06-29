# Upload resized images to AWS S3

This project will allow to upload resized images to `AWS S3`.

## Usage

- Install dependencies `npm install` (Only first time)
- Build project `npm run build` or enable `Automatic tasks in Folder` in case of `vscode` usage.
- Set required environment variables. There are planty ways to do this. For example use `.env` file and run service using `vscode` task.

```
AWS_ACCESS_KEY_ID="..."
AWS_ACCESS_KEY="..."
AWS_BUCKET="..."
```
- Start project `npm run start` or just `play` button in `vscode`

## Uploading file

Upload file is posible using `curl`. Just replace `<path_to_image>` and `<destination_file_name>` with correct ones and press Enter.

```
curl -v --request POST --data-binary "@<path_to_image>" -H "Content-type: image/jpeg" localhost/<destination_file_name>
```

## Optional enviroment variables

Server port to start listen on.

Default: 80

```
SERVER_PORT=8080
```

Maximum allowed upload size in bytes.

Default: 10 MB

```
MAXIMUM_UPLOAD_SIZE=5000
```

Allowed content types to upload to.

Default: image/jpeg,image/png

```
ALLOWED_CONTENT_TYPES=image/png
```

## Limitations

Current service uses `sharp` dependency to resize uploaded image.

Dependency supports following file types:

`JPEG`, `PNG`, `WebP`, `GIF`, `AVIF`, `TIFF` and `SVG`

## Dependencies

- [AWS SDK](https://github.com/aws/aws-sdk-js) - To upload resources to AWS S3
- [Shap](https://github.com/lovell/sharp) - To resize images

---

> Note: Service tested only on `MacOS` platform.