import File from '../models/File';

export default async (req, res, next) => {
  const { status } = req.query;

  if (status && status === 'delivered') {
    const { originalname: name, filename: path } = req.file;
    try {
      await File.create({
        name,
        path,
      });

      const { id } = await File.findOne({
        where: { name },
      });

      req.signatureId = id;

      return next();
    } catch (error) {
      return res.status(401).json(error);
    }
  }
  return next();
};
