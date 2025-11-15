# Next.js Migration Guide

## Overview
This document describes the migration from Create React App (CRA) to Next.js 15 with enhanced UI features.

## What Changed

### Framework Migration
- **From**: Create React App with React Router
- **To**: Next.js 15 with App Router

### Routing Changes
- **Old**: React Router (`BrowserRouter`, `Routes`, `Route`)
- **New**: Next.js App Router (file-based routing)

### Key File Structure Changes

```
Before (CRA):
src/
  ├── pages/
  │   ├── Login.tsx
  │   └── Dashboard.tsx
  ├── App.tsx (Router setup)
  └── index.tsx

After (Next.js):
app/
  ├── layout.tsx (Root layout)
  ├── page.tsx (Home redirect)
  ├── login/
  │   ├── layout.tsx
  │   └── page.tsx
  └── dashboard/
      ├── layout.tsx
      └── page.tsx
src/
  ├── pages.old/ (Backup of old pages)
  └── components/ (Reusable components)
```

## Running the Application

### Development
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Production Build
```bash
npm run build
npm run next:start
```

### Legacy CRA (Still available for rollback)
```bash
npm start  # CRA development server
```

## New Features

### 1. Dark Mode with next-themes
- System preference detection
- Manual toggle with smooth transitions
- Persistent theme selection
- Glassmorphism toggle component

### 2. Modern Button Designs
- Gradient backgrounds (blue-to-indigo, red-to-rose, etc.)
- Layered shadow effects
- Active scale animations
- Smooth transitions (300ms)
- Multiple variants: default, destructive, outline, secondary, ghost, link

### 3. Enhanced Dark Mode Colors
- Darker background for better contrast
- Improved foreground colors
- Better muted/accent colors
- Optimized for WCAG AA compliance

### 4. Improved Type Safety
- Full TypeScript support throughout
- Proper typing for all components
- Next.js type generation

## Environment Variables

The application still uses the same environment variables:
```
REACT_APP_API_URL=your_api_url
REACT_APP_USER_POOL_ID=your_user_pool_id
REACT_APP_CLIENT_ID=your_client_id
```

These are automatically exposed to the Next.js app via next.config.js.

## Migration Considerations

### Client vs Server Components
- All interactive components are marked with `'use client'`
- Pages that use localStorage are dynamically rendered
- Static generation is disabled for authenticated routes

### Import Path Changes
- Changed from relative paths to @/ alias where applicable
- Updated component imports to use correct paths
- Fixed hook imports (e.g., use-toast)

### Backward Compatibility
- Old CRA setup is preserved in src/pages.old
- Can still run CRA version with `npm start`
- Gradual migration path available

## Known Issues & Solutions

### Issue: "Cannot find module './pages/Login'"
**Solution**: Old pages moved to src/pages.old. Update imports or use Next.js pages.

### Issue: "useState is not a function"
**Solution**: Add `'use client'` directive to components using hooks.

### Issue: Pre-rendering errors with localStorage
**Solution**: Add `export const dynamic = 'force-dynamic'` to disable static generation.

## Performance Improvements

- **Faster Initial Load**: Next.js optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component (not yet implemented)
- **Font Optimization**: Google Fonts via link tags

## Future Enhancements

1. Implement Next.js Image component for optimized images
2. Add middleware for authentication checks
3. Implement ISR (Incremental Static Regeneration) where applicable
4. Add API routes for backend functionality
5. Implement advanced caching strategies

## Rollback Plan

If you need to rollback to CRA:
1. Restore src/pages from src/pages.old
2. Remove app/ directory
3. Update package.json scripts to use CRA
4. Run `npm start` instead of `npm run dev`

## Testing

### Manual Testing Checklist
- [ ] Login page loads correctly
- [ ] Sign up flow works
- [ ] OTP verification works
- [ ] Dashboard loads after authentication
- [ ] File upload works
- [ ] File delete works
- [ ] Folder operations work
- [ ] Dark mode toggle works
- [ ] Theme persists across pages
- [ ] Responsive design works on mobile

### Build Testing
```bash
npm run build  # Should complete without errors
```

## Support

For issues or questions:
1. Check this migration guide
2. Review Next.js 15 documentation
3. Check the GitHub issues
4. Contact the development team
