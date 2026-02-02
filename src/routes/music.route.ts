import { Router } from 'express';
import { MusicController } from '../controllers/music.controller';

export const MusicRoutes = (router: Router): void => {
  // Member routes
  router.get('/members', MusicController.getMembers);
  router.post('/members', MusicController.createMember);
  router.put('/members', MusicController.updateMember);
  router.delete('/members', MusicController.deleteMember);

  // Role routes
  router.get('/roles', MusicController.getRoles);
  router.post('/roles', MusicController.createRole);
  router.put('/roles', MusicController.updateRole);
  router.delete('/roles', MusicController.deleteRole);

  // Schedule routes
  router.get('/schedules', MusicController.getSchedules);
  router.post('/schedules', MusicController.createSchedule);
  router.put('/schedules', MusicController.updateSchedule);
  router.delete('/schedules', MusicController.deleteSchedule);

  // ServiceAssignment routes
  router.get('/service-assignments', MusicController.getServiceAssignments);
  router.post('/service-assignments', MusicController.createServiceAssignment);
  router.put('/service-assignments', MusicController.updateServiceAssignment);
  router.delete(
    '/service-assignments',
    MusicController.deleteServiceAssignment,
  );
};
