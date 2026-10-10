import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { key, ext = 'bin' } = req.body || {};
  if (key !== process.env.ACCESS_KEY) return res.status(403).json({ error: 'Chave inválida' });

  const filename = Array.from({ length: 10 }, () =>
    'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
  ).join('') + '.' + ext;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: filename }),
    { expiresIn: 300 } // 5 minutos
  );

  res.status(200).json({
    uploadUrl,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${filename}`,
  });
}