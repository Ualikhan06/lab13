import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseItem from './ExpenseItem';

const expense = {
  id: 1,
  description: 'Обед в кафе',
  amount: 2500,
  category: 'Еда',
  important: false
};

test('показывает описание, сумму и категорию расхода', () => {
  render(<ExpenseItem expense={expense} onHighlight={() => {}} onDelete={() => {}} />);
  expect(screen.getByText(/Обед в кафе — 2500 ₸ \(Еда\)/)).toBeInTheDocument();
});

test('кнопка «Удалить» вызывает onDelete с id', async () => {
  const onDelete = vi.fn();
  render(<ExpenseItem expense={expense} onHighlight={() => {}} onDelete={onDelete} />);
  await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
  expect(onDelete).toHaveBeenCalledWith(1);
});

test('клик по чекбоксу вызывает onHighlight(1)', async () => {
  const onHighlight = vi.fn();
  render(<ExpenseItem expense={expense} onHighlight={onHighlight} onDelete={() => {}} />);
  await userEvent.click(screen.getByRole('checkbox'));
  expect(onHighlight).toHaveBeenCalledWith(1);
});

test('при important: true текст зачёркнут', () => {
  const checkedExpense = { ...expense, important: true };
  render(<ExpenseItem expense={checkedExpense} onHighlight={() => {}} onDelete={() => {}} />);
  expect(screen.getByText(/Обед в кафе — 2500 ₸ \(Еда\)/)).toHaveStyle('text-decoration: line-through');
});
