import axios from 'axios';

export const isAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (authorization) {
    }

    if (authorization) {
      const token = authorization.slice(7, authorization.length);
      const { data } = await axios.get(
        'https://www.mrigel.dz/api/user/get_info?hash=' + token
      );
      if (!data) {
        return res.status(401).send('Invalid hash');
      }
      const { id } = data.user_info;
      (req.user_id = id), next();
    } else {
      res.status(400).send('No hash given');
    }
  } catch (error) {
    res.status(500).send('Unauthorized');
  }
};
