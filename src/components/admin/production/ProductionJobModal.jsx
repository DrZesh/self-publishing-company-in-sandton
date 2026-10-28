import React, { useState } from 'react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const JOB_TYPES = [
  'Sample Print',
  'Mass Production',
  'Cover Print',
  'Interior Print',
  'Reprint',
];

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

export default function ProductionJobModal({ job, onClose }) {
  const [formData, setFormData] = useState({
    job_type: job?.job_type || 'Sample Print',
    quantity: job?.quantity || 1,
    book_title: job?.book_title || '',
    book_size: job?.book_size || 'A5',
    page_count: job?.page_count || 0,
    paper_type: job?.paper_type || 'Cream 90gsm',
    colour_type: job?.colour_type || 'Black & White',
    cover_finish: job?.cover_finish || 'Matte',
    binding_type: job?.binding_type || 'Perfect Bound',
    priority: job?.priority || 'Normal',
    deadline: job?.deadline || '',
    assigned_operator: job?.assigned_operator || '',
    special_instructions: job?.special_instructions || '',
  });

  const handleSave = async () => {
    try {
      const action = job ? 'update' : 'create';
      const res = await platform.functions.invoke('manageProductionJobs', {
        action,
        job_id: job?.id,
        data: formData,
      });

      if (res.data.success) {
        toast.success(job ? 'Job updated' : 'Job created');
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save job');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Production Job' : 'Create Production Job'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {job && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Job Number: {job.job_number}</div>
              <div className="text-xs text-gray-500">Created: {job.created_date ? new Date(job.created_date).toLocaleString('en-ZA') : 'N/A'}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Job Type</label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => setFormData({ ...formData, job_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Book Title</label>
            <Input
              value={formData.book_title}
              onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
              placeholder="Enter book title"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Book Size</label>
              <Input
                value={formData.book_size}
                onChange={(e) => setFormData({ ...formData, book_size: e.target.value })}
                placeholder="e.g., A5, 6x9"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Page Count</label>
              <Input
                type="number"
                value={formData.page_count}
                onChange={(e) => setFormData({ ...formData, page_count: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Paper Type</label>
              <Input
                value={formData.paper_type}
                onChange={(e) => setFormData({ ...formData, paper_type: e.target.value })}
                placeholder="e.g., Cream 90gsm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Colour Type</label>
              <Select
                value={formData.colour_type}
                onValueChange={(value) => setFormData({ ...formData, colour_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black & White">Black & White</SelectItem>
                  <SelectItem value="Full Colour">Full Colour</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cover Finish</label>
              <Input
                value={formData.cover_finish}
                onChange={(e) => setFormData({ ...formData, cover_finish: e.target.value })}
                placeholder="e.g., Matte, Gloss"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Binding Type</label>
              <Select
                value={formData.binding_type}
                onValueChange={(value) => setFormData({ ...formData, binding_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perfect Bound">Perfect Bound</SelectItem>
                  <SelectItem value="Saddle Stitch">Saddle Stitch</SelectItem>
                  <SelectItem value="Hardcover">Hardcover</SelectItem>
                  <SelectItem value="Spiral">Spiral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Deadline</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assigned Operator</label>
              <Input
                value={formData.assigned_operator}
                onChange={(e) => setFormData({ ...formData, assigned_operator: e.target.value })}
                placeholder="Operator name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Special Instructions</label>
            <Textarea
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {job ? 'Update Job' : 'Create Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}