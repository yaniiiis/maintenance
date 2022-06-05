import express from 'express';
import Prisma from '@prisma/client';
import axios from 'axios';
import { isAuth } from '../utils.js';

const { PrismaClient } = Prisma;

const userRouter = express.Router();
const { user } = new PrismaClient();

//get navixy super user hash
userRouter.post('/superusertoken', async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(401).send('No hash found');
    }
    const hashValid = await axios.post(
      'https://www.mrigel.dz/api/panel/dealer/get_info',
      {
        hash: hash,
      }
    );
    const { success } = hashValid.data;
    if (!success) {
      return res.status(401).send('Invalid hash');
    }

    const { login, password } = req.body;
    const { data } = await axios.post(
      'https://www.mrigel.dz/api/panel/account/auth',
      {
        login: login,
        password: password,
      }
    );
    res.send(data);
  } catch (error) {
    res.send(error.message);
  }
});

// CREATE; check navixy super user hash and CREATE new user if the hash is verified
userRouter.post('/', async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const hash = authorization.slice(7, authorization.length);
    if (!hash) {
      return res.status(401).send('No hash found');
    }
    const { data } = await axios.post(
      'https://www.mrigel.dz/api/panel/dealer/get_info',
      {
        hash: hash,
      }
    );
    const { success } = data;
    if (!success) {
      return res.status(401).send('Invalid hash');
    }
    const { id } = req.body;

    const newUser = await user.create({ data: { id: id } });

    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//set user active
userRouter.put('/', async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const hash = authorization.slice(7, authorization.length);
    if (!hash) {
      return res.status(401).send('No hash found');
    }
    const { data } = await axios.post(
      'https://www.mrigel.dz/api/panel/dealer/get_info',
      {
        hash: hash,
      }
    );
    const { success } = data;

    if (!success) {
      return res.status(401).send('Invalid hash');
    }

    const { id, active } = req.body;
    const userExist = await user.findUnique({
      where: {
        id,
      },
    });
    if (!userExist) {
      return res.status(404).send('User not found');
    }
    const updatedUser = await user.update({
      where: {
        id,
      },
      data: {
        active,
      },
    });
    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



//get user maxDepense
userRouter.get('/depense', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const userData = await user.findFirst({
      where: {
        id: Number(user_id),
      },
  
    });

    const result={
      enabled:userData.maxDepenseAlert>-1,
      maxDepenseAlert:userData.maxDepenseAlert


    }
    
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//set user maxDepense
userRouter.put('/depense', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { maxDepenseAlert } = req.body;
    const settedUser = await user.update({
      where: {
        id: Number(user_id),
      },
      data: {
        maxDepenseAlert,
      },
    });
    res.status(200).send(settedUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//disable user maxDepense
userRouter.put('/depense/disable', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;

    const settedUser = await user.update({
      where: {
        id: Number(user_id),
      },
      data: {
        maxDepenseAlert:-1,
      },
    });
    res.status(200).send(settedUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

//delete user
userRouter.delete('/:id', async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const hash = authorization.slice(7, authorization.length);

    if (!hash) {
      return res.status(401).send('No hash found');
    }
    const { data } = await axios.post(
      'https://www.mrigel.dz/api/panel/dealer/get_info',
      {
        hash: hash,
      }
    );
    const { success } = data;
    if (!success) {
      return res.status(401).send('Invalid hash');
    }
    const { id } = req.params;
    const deletedUser = await user.deleteMany({
      where: {
        AND: {
          id: Number(id),
        },
      },
    });
    res.status(200).send('User deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

userRouter.get('/', async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const hash = authorization.slice(7, authorization.length);
    if (!hash) {
      return res.status(401).send('No hash found');
    }
    const { data } = await axios.post(
      'https://www.mrigel.dz/api/panel/dealer/get_info',
      {
        hash: hash,
      }
    );
    const { success } = data;
    if (!success) {
      return res.status(401).send('Invalid hash');
    }

    const allUsers = await user.findMany();

    res.status(201).send(allUsers);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default userRouter;
