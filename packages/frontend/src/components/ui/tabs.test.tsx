import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Tabs', () => {
    const TabsExample = ({ defaultValue = 'tab1' }: { defaultValue?: string }) => (
      <Tabs defaultValue={defaultValue}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3" disabled>Tab 3 (Disabled)</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
        <TabsContent value="tab3">Content for Tab 3</TabsContent>
      </Tabs>
    );

    it('should render tabs correctly', () => {
      render(<TabsExample />);

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3 (Disabled)')).toBeInTheDocument();
      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    });

    it('should show correct initial content based on defaultValue', () => {
      render(<TabsExample defaultValue="tab2" />);

      expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
      expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument();
    });

    it('should switch tabs when clicked', async () => {
      const user = userEvent.setup();
      render(<TabsExample />);

      // Initially show Tab 1 content
      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
      expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument();

      // Click Tab 2
      await user.click(screen.getByText('Tab 2'));

      // Should now show Tab 2 content
      expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
      expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument();
    });

    it('should not switch to disabled tab', async () => {
      const user = userEvent.setup();
      render(<TabsExample />);

      // Initially show Tab 1 content
      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();

      // Try to click disabled Tab 3
      await user.click(screen.getByText('Tab 3 (Disabled)'));

      // Should still show Tab 1 content
      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
      expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<TabsExample />);

      // Focus the first tab
      const tab1 = screen.getByText('Tab 1');
      tab1.focus();

      // Use arrow key to navigate to Tab 2
      await user.keyboard('{ArrowRight}');

      // Tab 2 should be focused and selected
      const tab2 = screen.getByText('Tab 2');
      expect(tab2).toHaveFocus();
      expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    });

    it('should handle controlled state', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();

      render(
        <Tabs value="tab1" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for Tab 1</TabsContent>
          <TabsContent value="tab2">Content for Tab 2</TabsContent>
        </Tabs>
      );

      await user.click(screen.getByText('Tab 2'));
      expect(onValueChange).toHaveBeenCalledWith('tab2');
    });

    it('should be accessible with proper ARIA attributes', () => {
      render(<TabsExample />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      const tabpanels = screen.getAllByRole('tabpanel');
      expect(tabpanels).toHaveLength(1); // Only active panel is rendered

      // Check active tab has correct aria-selected
      const activeTab = screen.getByText('Tab 1');
      expect(activeTab).toHaveAttribute('aria-selected', 'true');

      // Check disabled tab
      const disabledTab = screen.getByText('Tab 3 (Disabled)');
      expect(disabledTab).toHaveAttribute('disabled');
    });
  });

  describe('TabsList', () => {
    it('should render with correct styling when used within Tabs', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass(
        'inline-flex',
        'h-10',
        'items-center',
        'justify-center',
        'rounded-md',
        'p-1'
      );
    });

    it('should apply custom className', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList data-testid="tabs-list" className="custom-class">
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass('custom-class');
    });

    it('should spread additional props', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList data-testid="tabs-list" aria-label="Tab navigation">
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveAttribute('aria-label', 'Tab navigation');
    });
  });

  describe('TabsTrigger', () => {
    it('should render with correct styling', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger data-testid="tabs-trigger" value="test">
              Test
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'whitespace-nowrap',
        'rounded-sm',
        'px-3',
        'py-1.5',
        'text-sm',
        'font-bold',
        'font-heading'
      );
    });

    it('should apply custom className', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger data-testid="tabs-trigger" value="test" className="custom-class">
              Test
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveClass('custom-class');
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger data-testid="tabs-trigger" value="test" disabled>
              Test
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toBeDisabled();
    });

    it('should show active state when selected', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger data-testid="tabs-trigger" value="test">
              Test
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveAttribute('aria-selected', 'true');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger ref={ref} value="test">
              Test
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TabsContent', () => {
    it('should render with correct styling', () => {
      render(
        <Tabs defaultValue="test">
          <TabsContent data-testid="tabs-content" value="test">
            Test Content
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveClass(
        'mt-2',
        'focus-visible:outline-none',
        'focus-visible:ring-2'
      );
    });

    it('should apply custom className', () => {
      render(
        <Tabs defaultValue="test">
          <TabsContent data-testid="tabs-content" value="test" className="custom-class">
            Test Content
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveClass('custom-class');
    });

    it('should only render when active', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent data-testid="content1" value="tab1">
            Content 1
          </TabsContent>
          <TabsContent data-testid="content2" value="tab2">
            Content 2
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('should be focusable', () => {
      render(
        <Tabs defaultValue="test">
          <TabsContent data-testid="tabs-content" value="test">
            Test Content
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId('tabs-content');
      content.focus();
      expect(content).toHaveFocus();
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <Tabs defaultValue="test">
          <TabsContent ref={ref} value="test">
            Test Content
          </TabsContent>
        </Tabs>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tabs list', () => {
      render(
        <Tabs defaultValue="none">
          <TabsList data-testid="empty-list" />
        </Tabs>
      );

      const tabsList = screen.getByTestId('empty-list');
      expect(tabsList).toBeInTheDocument();
    });

    it('should handle tabs without content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
    });

    it('should handle content without matching tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="orphan">Orphan Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Orphan Content')).not.toBeInTheDocument();
    });
  });
});