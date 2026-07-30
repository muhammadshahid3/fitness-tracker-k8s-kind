# Instance ki Public IP dekhne ke liye
output "ec2_public_ip" {
  description = "EC2 instance ka public IP address"
  value       = aws_instance.my_ec2.public_ip
}

# Instance ki ID dekhne ke liye
output "ec2_private" {
  description = "EC2 instance ki unique ID"
  value       = aws_instance.my_ec2.private_ip
}

# SSH karne ki tayyar command dekhne ke liye (Ubuntu user ke liye)
