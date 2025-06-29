const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - VITE_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nMake sure your .env file contains these variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateCoverImages() {
  console.log('🚀 Starting cover image update for existing projects...\n')
  
  try {
    // Get all projects that have steps
    console.log('📋 Fetching all projects with steps...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, cover_image_url')
      .order('created_at', { ascending: false })

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`)
    }

    if (!projects || projects.length === 0) {
      console.log('ℹ️  No projects found.')
      return
    }

    console.log(`📊 Found ${projects.length} projects to check\n`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Process each project
    for (const project of projects) {
      console.log(`🔍 Processing: "${project.title}" (${project.id})`)
      
      try {
        // Get all steps for this project, ordered by step_number
        const { data: steps, error: stepsError } = await supabase
          .from('steps')
          .select('step_number, image_url')
          .eq('project_id', project.id)
          .order('step_number', { ascending: true })

        if (stepsError) {
          console.log(`   ❌ Error fetching steps: ${stepsError.message}`)
          errorCount++
          continue
        }

        if (!steps || steps.length === 0) {
          console.log('   ⚠️  No steps found, skipping')
          skippedCount++
          continue
        }

        // Find the last step with an image
        const lastStepWithImage = steps
          .reverse() // Start from the last step
          .find(step => step.image_url && step.image_url.trim() !== '')

        if (!lastStepWithImage) {
          console.log('   ⚠️  No steps with images found, skipping')
          skippedCount++
          continue
        }

        // Check if cover image is already the same as the last step's image
        if (project.cover_image_url === lastStepWithImage.image_url) {
          console.log(`   ✅ Cover image already matches last step (step ${lastStepWithImage.step_number}), skipping`)
          skippedCount++
          continue
        }

        // Update the project's cover image
        const { error: updateError } = await supabase
          .from('projects')
          .update({ 
            cover_image_url: lastStepWithImage.image_url 
          })
          .eq('id', project.id)

        if (updateError) {
          console.log(`   ❌ Error updating cover image: ${updateError.message}`)
          errorCount++
          continue
        }

        console.log(`   ✅ Updated cover image to step ${lastStepWithImage.step_number}'s image`)
        updatedCount++

      } catch (error) {
        console.log(`   ❌ Unexpected error: ${error.message}`)
        errorCount++
      }

      console.log('') // Empty line for readability
    }

    // Summary
    console.log('📊 Update Summary:')
    console.log(`   ✅ Updated: ${updatedCount} projects`)
    console.log(`   ⚠️  Skipped: ${skippedCount} projects`)
    console.log(`   ❌ Errors: ${errorCount} projects`)
    console.log(`   📋 Total: ${projects.length} projects processed`)

    if (updatedCount > 0) {
      console.log('\n🎉 Cover image update completed successfully!')
    } else {
      console.log('\nℹ️  No projects needed updating.')
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Add some helpful command line options
const args = process.argv.slice(2)
const showHelp = args.includes('--help') || args.includes('-h')
const dryRun = args.includes('--dry-run') || args.includes('-d')

if (showHelp) {
  console.log(`
📖 Cover Image Update Script

This script updates the cover images of existing projects to use their last step's image.

Usage:
  node scripts/update-cover-images.js [options]

Options:
  --help, -h     Show this help message
  --dry-run, -d  Show what would be updated without making changes

Environment Variables Required:
  VITE_SUPABASE_URL          Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY  Your Supabase service role key

Examples:
  node scripts/update-cover-images.js
  node scripts/update-cover-images.js --dry-run
`)
  process.exit(0)
}

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made\n')
  // TODO: Implement dry run logic if needed
}

// Run the update
updateCoverImages()