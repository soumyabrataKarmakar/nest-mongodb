import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsS3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get("AWS_REGION")
    });
  }

  async uploadImageToS3(imageBuffer: Buffer, filename: string): Promise<string> {
    const params = {
      Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
      Key: filename,
      Body: imageBuffer
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }
}
