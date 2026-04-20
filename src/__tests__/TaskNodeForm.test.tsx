import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskNodeForm } from '../components/forms/TaskNodeForm';
import { WorkflowNode, TaskNodeData } from '../types/workflow';

// ─── Mock Zustand store ───────────────────────────────────────────────────────

const mockUpdateNodeData = jest.fn();

jest.mock('../hooks/useWorkflowStore', () => ({
  useWorkflowStore: (selector: any) => {
    const store = { updateNodeData: mockUpdateNodeData };
    return selector ? selector(store) : store;
  },
}));

// ─── Fixture ──────────────────────────────────────────────────────────────────

const makeTaskNode = (overrides: Partial<TaskNodeData> = {}): WorkflowNode => ({
  id: 'test-node-1',
  type: 'task',
  position: { x: 0, y: 0 },
  data: {
    type: 'task',
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    customFields: [],
    ...overrides,
  },
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TaskNodeForm', () => {
  beforeEach(() => {
    mockUpdateNodeData.mockClear();
  });

  it('renders all required form fields', () => {
    render(<TaskNodeForm node={makeTaskNode()} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('pre-fills fields from existing node data', () => {
    render(
      <TaskNodeForm
        node={makeTaskNode({
          title: 'Collect Documents',
          assignee: 'HR Admin',
          description: 'Ask for ID',
        })}
      />
    );
    expect(screen.getByDisplayValue('Collect Documents')).toBeInTheDocument();
    expect(screen.getByDisplayValue('HR Admin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ask for ID')).toBeInTheDocument();
  });

  // The validation error test: react-hook-form in onChange mode only shows errors
  // after the field is touched AND invalid. We trigger that by clearing then blurring.
  it('shows validation error when title is cleared and blurred', async () => {
    const user = userEvent.setup();
    // Start with a non-empty title so the form is initialized
    render(<TaskNodeForm node={makeTaskNode({ title: 'Existing' })} />);

    const titleInput = screen.getByLabelText(/title/i);
    // Clear the existing value then blur
    await user.triple_click?.(titleInput) ?? await user.click(titleInput);
    await user.clear(titleInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls updateNodeData when user types in title field', async () => {
    const user = userEvent.setup();
    render(<TaskNodeForm node={makeTaskNode()} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Review Contract');

    await waitFor(() => {
      expect(mockUpdateNodeData).toHaveBeenCalledWith(
        'test-node-1',
        expect.objectContaining({ title: expect.stringContaining('Review') })
      );
    });
  });

  it('calls updateNodeData when user fills the assignee field', async () => {
    const user = userEvent.setup();
    render(<TaskNodeForm node={makeTaskNode({ title: 'Existing Title' })} />);

    const assigneeInput = screen.getByLabelText(/assignee/i);
    await user.type(assigneeInput, 'Jane Doe');

    await waitFor(() => {
      expect(mockUpdateNodeData).toHaveBeenCalledWith(
        'test-node-1',
        expect.objectContaining({ assignee: expect.stringContaining('Jane') })
      );
    });
  });

  it('renders the Custom Fields section with an Add button', () => {
    render(<TaskNodeForm node={makeTaskNode()} />);
    // Use role=button to avoid matching text in the "No fields added yet" paragraph
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('adds a custom field row when Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskNodeForm node={makeTaskNode()} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // After clicking Add, key/value placeholders should appear
    expect(screen.getByPlaceholderText(/field name/i)).toBeInTheDocument();
  });
});
