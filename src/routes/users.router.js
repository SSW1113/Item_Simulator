import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
  try {
    const { accountName, password, passwordCheck } = req.body;

    const isExistUser = await prisma.accounts.findFirst({
      where: { accountName },
    });

    // 계정명 중복 불가
    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 계정명입니다.' });
    }

    // 계정명 조건 확인
    const account = /^[a-z0-9]+$/;
    if (!account.test(accountName)) {
      return res.status(400).json({ message: '영어 소문자 + 숫자 조합이어야 합니다.' });
    }

    // 비밀번호 확인 일치 확인
    if (password !== passwordCheck) {
      return res.status(400).json({ message: '비밀번호 확인이 일치하지 않습니다.' });
    }

    // 비밀번호 조건 확인
    if (password.length < 6) {
      return res.status(400).json({ message: '비밀번호의 길이가 최소 6자 이상이어야 합니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.accounts.create({
      data: {
        accountName,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      accountName: user.accountName,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
  try {
    const { accountName, password } = req.body;

    const user = await prisma.accounts.findFirst({ where: { accountName } });

    // 계정명 확인
    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 계정명입니다.' });
    }

    // 비밀번호 확인
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 토큰 생성
    const token = jwt.sign({ accountId: user.accountId }, 'custom-secret-key');

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인에 성공하였습니다.' });
  } catch (err) {
    next(err);
  }
});

//

export default router;
