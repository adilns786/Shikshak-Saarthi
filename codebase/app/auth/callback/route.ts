
// 2. AUTH CALLBACK HANDLER (auth/callback/route.ts)
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/error?message=Invalid verification link', requestUrl.origin))
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata.full_name,
            role: data.user.user_metadata.role,
            department: data.user.user_metadata.department,
            employee_id: data.user.user_metadata.employee_id,
            email_verified: true,
            created_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('Unexpected error:', error)
      return NextResponse.redirect(new URL('/auth/error?message=Verification failed', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/auth/error?message=No verification code provided', requestUrl.origin))
}
