# TODO

## Completed Today

### Removed Unnecessary Complexity

- [x] Deleted entire npm audit-filter system (8,247 lines across 49 files)
- [x] Removed Storybook entirely (fixed critical vulnerability, removed ~15 dependencies)
- [x] Simplified CI/CD pipeline significantly

## Active Tasks

### Implement External Image URL Support

- [ ] Add support for external image URLs in readings instead of self-hosted only
- [ ] Update ReadingCard component to handle both external and internal URLs
- [ ] Update admin interface to accept external image URLs
- [ ] Add URL validation for external images
- [ ] Update database schema if needed for URL vs path distinction

## Future Improvements

### UI/UX Enhancements

- [ ] Overhaul style with modern design patterns
- [ ] Consider magic UI background (particles, flickering grid, animated patterns)
- [ ] Improve mobile responsiveness
- [ ] Add loading states and transitions

### Performance

- [ ] Implement image optimization for external URLs
- [ ] Add caching strategies for external images
- [ ] Review and optimize bundle size

### Documentation

- [ ] Update README with new image URL feature
- [ ] Document API changes for external images
- [ ] Add examples of both internal and external image usage
