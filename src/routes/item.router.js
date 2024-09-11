import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 아이템 생성 API
router.post('/items', async (req, res, next) => {
  try {
    const { name, health, power } = req.body;

    // 이름 중복 체크
    const isExistItem = await prisma.items.findFirst({
      where: { name },
    });

    if (isExistItem) {
      return res.status(401).json({ message: '이미 존재하는 아이템 이름입니다.' });
    }

    const item = await prisma.items.create({
      data: {
        name: name,
        health: health,
        power: power,
      },
    });

    return res.status(201).json({
      message: '아이템 생성에 성공하였습니다.',
      data: item,
    });
  } catch (err) {
    next(err);
  }
});

// 아이템 수정 API
router.patch('/items/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { name, health, power } = req.body;

    const isExistItem = await prisma.items.findFirst({
      where: { itemId: +itemId },
    });

    if (!isExistItem) {
      return res.status(404).json({ message: '존재하지 않는 아이템입니다.' });
    }

    const updatedItem = await prisma.items.update({
      where: { itemId: +itemId },
      data: {
        name: name,
        health: health,
        power: power,
      },
    });

    return res.status(200).json({
      message: '아이템을 성공적으로 수정했습니다.',
      data: updatedItem,
    });
  } catch (err) {
    next(err);
  }
});

// 아이템 목록 조회 API
router.get('/items', async (req, res, next) => {
  try {
    const items = await prisma.items.findMany({
      select: {
        itemId: true,
        name: true,
        health: true,
        power: true,
      },
      orderBy: {
        itemId: 'asc',
      },
    });

    return res.status(200).json({ data: items });
  } catch (err) {
    next(err);
  }
});

// 아이템 상세보기 API
router.get('/items/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await prisma.items.findFirst({
      where: { itemId: +itemId },
      select: {
        itemId: true,
        name: true,
        health: true,
        power: true,
      },
    });

    return res.status(200).json({ data: item });
  } catch (err) {
    next(err);
  }
});

export default router;
