import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 캐릭터 생성 API
router.post('/characters', authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;
    const accountName = req.user.accountName;

    // 이름 중복 체크
    const isExistCharacterName = await prisma.characters.findFirst({
      where: { name: name },
    });

    if (isExistCharacterName) {
      return res.status(409).json({ message: '이미 존재하는 캐릭터 이름입니다.' });
    }

    const character = await prisma.characters.create({
      data: {
        accountName: accountName,
        name: name,
        level: 1,
        power: 100,
        health: 500,
        money: 10000,
      },
    });

    return res.status(201).json({
      message: '캐릭터 생성에 성공하였습니다.',
      data: character,
    });
  } catch (err) {
    next(err);
  }
});

// 캐릭터 삭제 API
router.delete('/characters/:characterId', authMiddleware, async (req, res, next) => {
  try {
    const { characterId } = req.params;

    const character = await prisma.characters.findFirst({
      where: { characterId },
    });

    if (!character) {
      return res.status(401).json({ message: '존재하지 않는 캐릭터입니다.' });
    }

    await prisma.characters.delete({ characterId: characterId });

    return res.status(200).json({ message: '캐릭터를 성공적으로 삭제하였습니다.' });
  } catch (err) {
    next(err);
  }
});

// 캐릭터 상세보기 API
router.get('/characters/:characterId', authMiddleware, async (req, res, next) => {
  const { characterId } = req.params;

  const character = await prisma.characters.findFirst({
    where: { characterId: +characterId },
    select: {
      characterId: true,
      level: true,
      name: true,
      power: true,
      health: true,
      money: true,
      createdAt: true,
      account: {
        select: {
          accountName: true,
        },
      },
    },
  });

  return res.status(200).json({ data: character });
});

export default router;
