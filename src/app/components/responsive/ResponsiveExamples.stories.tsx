import type { Meta, StoryObj } from '@storybook/react';
import ResponsivePatterns from './ResponsiveExamples';

const meta: Meta<typeof ResponsivePatterns> = {
  title: 'Design System/Responsive',
  component: ResponsivePatterns,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
