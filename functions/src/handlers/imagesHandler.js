import { getImageStorage } from '../firebase/utils.js';

export const getImagesUrl = async (req, res, next) => {
  const url = req.body;

  console.log('url', url);

  try {
    const imageUrl = await getImageStorage(url);

    console.log('imageUrl', imageUrl);

    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.log('error', error);
    next(error);
  }
};
